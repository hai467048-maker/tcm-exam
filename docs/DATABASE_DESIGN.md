# 杏林题库 — 数据库设计文档

> 版本：v1.0 | 目标：支持百万级题目、高并发查询、弹性扩展
> 数据库：MySQL 8.0+ | 缓存：Redis 7+ | 搜索引擎：Elasticsearch 8+

---

## 一、ER 图设计

### 1.1 核心实体关系

`
┌─────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│       users         │       │      questions        │       │  knowledge_points      │
│  (用户表)           │       │   (题目表)            │       │  (知识点表)            │
├─────────────────────┤       ├──────────────────────┤       ├────────────────────────┤
│ id (PK)             │       │ id (PK)               │       │ id (PK)                │
│ email (UK)          │◄──────│ created_by (FK)       │       │ parent_id (FK,自引用) │
│ phone (UK)          │       │ reviewed_by (FK)      │       │ name                   │
│ role                │       │                       │       │ level                  │
└─────────┬───────────┘       └──────────┬───────────┘       └────────────┬───────────┘
          │                              │                                │
          │ 1:N                          │ 1:N                            │ 1:N
          │                              │                                │
          ▼                              ▼                                ▼
┌─────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│   user_answers      │       │  question_options     │       │  question_knowledge    │
│  (答题记录)         │       │  (选项表)             │       │  (题目知识点关联)      │
├─────────────────────┤       ├──────────────────────┤       ├────────────────────────┤
│ id (PK)             │       │ id (PK)               │       │ id (PK)                │
│ user_id (FK)        │       │ question_id (FK)      │       │ question_id (FK)       │
│ question_id (FK)    │       │ label CHAR(1)         │       │ knowledge_id (FK)      │
│ answer_at (索引)    │       │ sort_order            │       │ weight                 │
└─────────────────────┘       └──────────────────────┘       └────────────────────────┘
          │                              │
          │ 1:N                          │ 1:N
          │                              │
          ▼                              ▼
┌─────────────────────┐       ┌──────────────────────┐
│  wrong_questions    │       │     favorites         │
│  (错题表)          │       │   (收藏表)            │
├─────────────────────┤       ├──────────────────────┤
│ id (PK)             │       │ id (PK)               │
│ user_id (FK)        │       │ user_id (FK)          │
│ question_id (FK)    │       │ question_id (FK)      │
│ error_count         │       │ collection_id (FK)    │
│ mastery_status      │       │ note TEXT             │
└─────────────────────┘       └──────────────────────┘

┌─────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│     notes           │       │    mock_exams         │       │   exam_records         │
│  (学习笔记)        │       │  (模拟考试定义)       │       │  (考试记录)            │
├─────────────────────┤       ├──────────────────────┤       ├────────────────────────┤
│ id (PK)             │       │ id (PK)               │       │ id (PK)                │
│ user_id (FK)        │       │ exam_category         │       │ user_id (FK)           │
│ question_id (FK)    │       │ time_limit            │       │ exam_id (FK)           │
│ content TEXT        │       │ question_count        │       │ score                  │
│ created_at          │       │ difficulty            │       │ answers JSON           │
└─────────────────────┘       └──────────────────────┘       └────────────────────────┘

┌────────────────────────┐
│   study_statistics     │
│  (学习统计)            │
├────────────────────────┤
│ id (PK)                │
│ user_id (FK, UK)       │
│ stat_date (UK)         │
│ answered_count         │
│ correct_count          │
│ study_duration_sec     │
└────────────────────────┘
`

---

## 二、表结构

### 2.1 users — 用户表

`sql
CREATE TABLE users (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  username        VARCHAR(64)       NOT NULL                 COMMENT '用户名',
  email           VARCHAR(255)      DEFAULT NULL             COMMENT '邮箱',
  phone           VARCHAR(20)       DEFAULT NULL             COMMENT '手机号',
  password_hash   VARCHAR(255)      NOT NULL                 COMMENT '密码哈希',
  avatar_url      VARCHAR(500)      DEFAULT NULL             COMMENT '头像URL',
  role            ENUM('student','editor','reviewer','admin','super_admin')
                                    NOT NULL DEFAULT 'student' COMMENT '角色',
  status          TINYINT           NOT NULL DEFAULT 1       COMMENT '状态:1正常 0禁用',
  exam_type       VARCHAR(50)       DEFAULT NULL             COMMENT '备考类型:执业医师/助理医师',
  extra_data      JSON              DEFAULT NULL             COMMENT '扩展字段',
  last_login_at   DATETIME          DEFAULT NULL             COMMENT '最后登录时间',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME          DEFAULT NULL             COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  UNIQUE KEY uk_phone (phone),
  UNIQUE KEY uk_username (username),
  INDEX idx_role_status (role, status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';
`

### 2.2 questions — 题目表（核心表）

`sql
CREATE TABLE questions (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '题目ID',
  question_type     ENUM('single','multiple','a1','a2','b1','case')
                                      NOT NULL                 COMMENT '题型',
  exam_category     VARCHAR(50)       NOT NULL                 COMMENT '考试类别:执业医师/助理医师',
  subject           VARCHAR(100)      NOT NULL                 COMMENT '科目',
  difficulty        TINYINT UNSIGNED  NOT NULL DEFAULT 3       COMMENT '难度1-5',
  year              SMALLINT UNSIGNED DEFAULT NULL             COMMENT '真题年份',
  source            VARCHAR(100)      DEFAULT NULL             COMMENT '来源',
  tags              JSON              DEFAULT NULL             COMMENT '标签数组',
  content           MEDIUMTEXT        NOT NULL                 COMMENT '题目正文(支持HTML)',
  content_text      MEDIUMTEXT        DEFAULT NULL             COMMENT '纯文本(用于搜索)',
  answer            JSON              NOT NULL                 COMMENT '正确答案数组',
  analysis          MEDIUMTEXT        DEFAULT NULL             COMMENT '详细解析(HTML)',
  clinical_thought  MEDIUMTEXT        DEFAULT NULL             COMMENT '临床思路',
  key_points        JSON              DEFAULT NULL             COMMENT '考点总结数组',
  common_mistakes   JSON              DEFAULT NULL             COMMENT '易错点提醒数组',
  related_q_ids     JSON              DEFAULT NULL             COMMENT '关联题目ID数组',
  status            ENUM('draft','pending','approved','rejected')
                                      NOT NULL DEFAULT 'draft' COMMENT '审核状态',
  version           INT UNSIGNED      NOT NULL DEFAULT 1       COMMENT '当前版本号',
  latest_version_id BIGINT UNSIGNED   DEFAULT NULL             COMMENT '最新版本记录ID',
  created_by        BIGINT UNSIGNED   NOT NULL                 COMMENT '创建人',
  reviewed_by       BIGINT UNSIGNED   DEFAULT NULL             COMMENT '审核人',
  review_comment    VARCHAR(500)      DEFAULT NULL             COMMENT '审核意见',
  extra_data        JSON              DEFAULT NULL             COMMENT '扩展字段',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME          DEFAULT NULL             COMMENT '软删除时间',
  PRIMARY KEY (id),
  FULLTEXT INDEX ft_content (content_text)                     COMMENT '全文搜索',
  INDEX idx_subject_year (subject, year),
  INDEX idx_subject_difficulty (subject, difficulty),
  INDEX idx_type_status (question_type, status),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='题目主表';
`

### 2.3 question_options — 选项表

`sql
CREATE TABLE question_options (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '选项ID',
  question_id     BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  label           CHAR(1)           NOT NULL                 COMMENT '选项标签(A/B/C/D/E)',
  content         VARCHAR(2000)     NOT NULL                 COMMENT '选项内容',
  sort_order      TINYINT UNSIGNED  NOT NULL DEFAULT 0       COMMENT '排序',
  extra_data      JSON              DEFAULT NULL             COMMENT '扩展字段',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at      DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_question_id (question_id),
  INDEX idx_question_sort (question_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='题目选项表';
`

### 2.4 knowledge_points — 知识点表

`sql
CREATE TABLE knowledge_points (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '知识点ID',
  parent_id       BIGINT UNSIGNED   DEFAULT NULL             COMMENT '父节点ID',
  name            VARCHAR(200)      NOT NULL                 COMMENT '知识点名称',
  level           TINYINT UNSIGNED  NOT NULL                 COMMENT '层级:1/2/3',
  sort_order      INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '排序',
  high_freq_points JSON             DEFAULT NULL             COMMENT '高频考点数组',
  easy_mistakes   JSON              DEFAULT NULL             COMMENT '易错点数组',
  status          TINYINT           NOT NULL DEFAULT 1       COMMENT '状态',
  extra_data      JSON              DEFAULT NULL             COMMENT '扩展字段',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_level (level),
  INDEX idx_parent_sort (parent_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='知识点表(树形结构)';
`

### 2.5 question_knowledge — 题目知识点关联表

`sql
CREATE TABLE question_knowledge (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '关联ID',
  question_id     BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  knowledge_id    BIGINT UNSIGNED   NOT NULL                 COMMENT '知识点ID',
  weight          TINYINT UNSIGNED  NOT NULL DEFAULT 1       COMMENT '关联权重(1-5)',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_question_knowledge (question_id, knowledge_id),
  INDEX idx_knowledge_id (knowledge_id),
  INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='题目知识点关联表';
`

### 2.6 user_answers — 用户答题记录表

`sql
CREATE TABLE user_answers (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  user_id         BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  question_id     BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  selected_answer JSON              NOT NULL                 COMMENT '用户选择答案',
  is_correct      TINYINT(1)        NOT NULL                 COMMENT '是否正确',
  time_spent_sec  INT UNSIGNED      DEFAULT 0                COMMENT '答题耗时(秒)',
  answer_source   ENUM('practice','mock_exam','daily','wrong_review')
                                    NOT NULL DEFAULT 'practice' COMMENT '答题来源',
  exam_record_id  BIGINT UNSIGNED   DEFAULT NULL             COMMENT '关联考试记录ID',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
  PRIMARY KEY (id),
  INDEX idx_user_question (user_id, question_id),
  INDEX idx_user_time (user_id, created_at),
  INDEX idx_question_correct (question_id, is_correct),
  INDEX idx_user_correct (user_id, is_correct),
  INDEX idx_source (answer_source),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户答题记录表';
`

### 2.7 wrong_questions — 错题表

`sql
CREATE TABLE wrong_questions (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  user_id           BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  question_id       BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  wrong_answer      JSON              NOT NULL                 COMMENT '错误答案',
  error_count       INT UNSIGNED      NOT NULL DEFAULT 1       COMMENT '累计错误次数',
  mastery_status    ENUM('not_mastered','reviewing','mastered')
                                      NOT NULL DEFAULT 'not_mastered' COMMENT '掌握状态',
  last_wrong_at     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最近答错时间',
  next_review_at    DATETIME          DEFAULT NULL             COMMENT '下次复习时间',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_question (user_id, question_id),
  INDEX idx_user_status (user_id, mastery_status),
  INDEX idx_user_next_review (user_id, next_review_at),
  INDEX idx_error_count (user_id, error_count DESC),
  INDEX idx_last_wrong (user_id, last_wrong_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='错题表';
`

### 2.8 favorites — 收藏表

`sql
CREATE TABLE favorite_collections (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '收藏夹ID',
  user_id         BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  name            VARCHAR(200)      NOT NULL                 COMMENT '收藏夹名称',
  description     VARCHAR(500)      DEFAULT NULL             COMMENT '描述',
  is_public       TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '是否公开',
  sort_order      INT UNSIGNED      DEFAULT 0                COMMENT '排序',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  UNIQUE KEY uk_user_name (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏夹表';

CREATE TABLE favorites (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '收藏ID',
  user_id         BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  question_id     BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  collection_id   BIGINT UNSIGNED   DEFAULT NULL             COMMENT '所属收藏夹',
  note            VARCHAR(500)      DEFAULT NULL             COMMENT '收藏备注',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_question (user_id, question_id),
  INDEX idx_collection (collection_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='收藏表';
`

### 2.9 notes — 学习笔记表

`sql
CREATE TABLE notes (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '笔记ID',
  user_id         BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  question_id     BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  content         MEDIUMTEXT        NOT NULL                 COMMENT '笔记内容(支持Markdown)',
  is_private      TINYINT(1)        NOT NULL DEFAULT 1       COMMENT '是否私密',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_user_question (user_id, question_id),
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='学习笔记表';
`

### 2.10 mock_exams — 模拟考试定义表

`sql
CREATE TABLE mock_exams (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '考试ID',
  title             VARCHAR(300)      NOT NULL                 COMMENT '考试标题',
  exam_category     VARCHAR(50)       NOT NULL                 COMMENT '考试类别',
  subject           VARCHAR(100)      DEFAULT NULL             COMMENT '科目(空=综合)',
  time_limit_min    INT UNSIGNED      NOT NULL DEFAULT 150     COMMENT '时限(分钟)',
  question_count    INT UNSIGNED      NOT NULL                 COMMENT '总题数',
  difficulty        TINYINT UNSIGNED  DEFAULT 3                COMMENT '难度等级',
  is_template       TINYINT(1)        NOT NULL DEFAULT 1       COMMENT '是否模板',
  question_ids      JSON              DEFAULT NULL             COMMENT '预置题目ID列表',
  rules             JSON              DEFAULT NULL             COMMENT '组卷规则(知识点分布)',
  attempt_count     INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '参与次数',
  avg_score         DECIMAL(5,2)      DEFAULT NULL             COMMENT '平均分',
  status            TINYINT           NOT NULL DEFAULT 1       COMMENT '状态',
  created_by        BIGINT UNSIGNED   NOT NULL                 COMMENT '创建人',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_category_subject (exam_category, subject),
  INDEX idx_is_template (is_template),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='模拟考试定义表';
`

### 2.11 exam_records — 模拟考试记录表

`sql
CREATE TABLE exam_records (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  user_id           BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  exam_id           BIGINT UNSIGNED   NOT NULL                 COMMENT '考试ID',
  questions         JSON              NOT NULL                 COMMENT '本次考试题目ID列表(快照)',
  answers           JSON              DEFAULT NULL             COMMENT '用户答案{question_id: answer}',
  score             DECIMAL(5,2)      DEFAULT NULL             COMMENT '得分',
  correct_count     INT UNSIGNED      DEFAULT 0                COMMENT '正确数',
  wrong_count       INT UNSIGNED      DEFAULT 0                COMMENT '错误数',
  total_questions   INT UNSIGNED      NOT NULL                 COMMENT '总题数',
  time_spent_sec    INT UNSIGNED      DEFAULT 0                COMMENT '用时(秒)',
  status            ENUM('in_progress','completed','abandoned')
                                      NOT NULL DEFAULT 'in_progress' COMMENT '考试状态',
  started_at        DATETIME          NOT NULL                 COMMENT '开始时间',
  submitted_at      DATETIME          DEFAULT NULL             COMMENT '提交时间',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  INDEX idx_exam_id (exam_id),
  INDEX idx_user_exam (user_id, exam_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='模拟考试记录表';
`

### 2.12 study_statistics — 学习统计表

`sql
CREATE TABLE study_statistics (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '统计ID',
  user_id           BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  stat_date         DATE              NOT NULL                 COMMENT '统计日期',
  answered_count    INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '答题数',
  correct_count     INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '正确数',
  wrong_count       INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '错误数',
  study_duration_sec INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '学习时长(秒)',
  subject_stats     JSON              DEFAULT NULL             COMMENT '分科目统计',
  extra_data        JSON              DEFAULT NULL             COMMENT '扩展字段',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_date (user_id, stat_date),
  INDEX idx_user_date_range (user_id, stat_date),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='学习统计表(按天聚合)';
`

### 2.13 版本管理辅助表

`sql
-- 题目版本历史
CREATE TABLE question_versions (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '版本ID',
  question_id       BIGINT UNSIGNED   NOT NULL                 COMMENT '题目ID',
  version           INT UNSIGNED      NOT NULL                 COMMENT '版本号',
  snapshot          JSON              NOT NULL                 COMMENT '题目快照(全字段)',
  change_summary    VARCHAR(500)      DEFAULT NULL             COMMENT '变更摘要',
  created_by        BIGINT UNSIGNED   NOT NULL                 COMMENT '操作人',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_question_id (question_id),
  INDEX idx_question_version (question_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='题目版本历史表';

-- 操作审计日志
CREATE TABLE audit_logs (
  id                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '日志ID',
  user_id           BIGINT UNSIGNED   NOT NULL                 COMMENT '操作人ID',
  action            VARCHAR(50)       NOT NULL                 COMMENT '操作类型',
  entity_type       VARCHAR(50)       NOT NULL                 COMMENT '实体类型',
  entity_id         BIGINT UNSIGNED   NOT NULL                 COMMENT '实体ID',
  old_value         JSON              DEFAULT NULL             COMMENT '旧值',
  new_value         JSON              DEFAULT NULL             COMMENT '新值',
  ip_address        VARCHAR(45)       DEFAULT NULL             COMMENT 'IP地址',
  user_agent        VARCHAR(500)      DEFAULT NULL             COMMENT '用户代理',
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='操作审计日志表';
`

---

## 三、索引方案

### 3.1 核心查询场景索引覆盖

| 查询场景 | 使用索引 | 说明 |
|----------|---------|------|
| 按科目+年份筛选题目 | idx_subject_year(subject, year) | 复合索引，覆盖科目列表页 |
| 按知识点查题目 | question_knowledge.idx_knowledge_id | 通过关联表反向查找 |
| 用户错题本列表 | wrong_questions.idx_user_status(user_id, mastery_status) | 用户+掌握状态筛选 |
| 用户答题历史 | user_answers.idx_user_time(user_id, created_at) | 时间线查询 |
| 全文搜索题目 | questions.ft_content | MySQL InnoDB 全文索引 |
| 模拟考试提交 | exam_records.idx_user_exam(user_id, exam_id) | 查重+详情 |
| 每日学习统计 | study_statistics.uk_user_date(user_id, stat_date) | 唯一键快速定位 |

### 3.2 索引设计原则

`
1. 查询驱动：所有索引基于真实查询模式设计，不建冗余索引。
2. 复合索引最左前缀：将区分度高的列放在最左。
3. 覆盖索引：对于高频查询，索引覆盖所有 SELECT 字段，避免回表。
4. 索引下推(ICP)：MySQL 8.0 默认开启，复合索引可过滤多条件。
5. 全文索引：使用 MySQL 内置 ngram 解析器支持中文分词。
6. 索引监控：定期使用 performance_schema 分析慢查询，删减无效索引。
`

### 3.3 全文搜索配置

`sql
-- 启用 ngram 中文分词解析器
ALTER TABLE questions
  DROP INDEX ft_content,
  ADD FULLTEXT INDEX ft_content (content_text) WITH PARSER ngram;

-- 搜索查询示例
SELECT id, content, MATCH(content_text) AGAINST('阴阳五行' IN BOOLEAN MODE) AS relevance
FROM questions
WHERE MATCH(content_text) AGAINST('+阴阳 +五行' IN BOOLEAN MODE)
  AND status = 'approved'
ORDER BY relevance DESC
LIMIT 20;
`

**搜索引擎升级路径：** 当单表数据量超过 500 万行后，建议引入 Elasticsearch 替代 MySQL 全文索引：

`
MySQL: 主从复制 + 读写分离
  └─> Canal: 监听 MySQL binlog
       └─> Elasticsearch: 索引 questions + knowledge_points
            └─> 搜索 API: DSL 查询 + 高亮 + 联想
`

---

## 四、缓存方案

### 4.1 缓存架构

`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Application │────▶│   Redis     │────▶│   MySQL     │
│  (API层)     │     │  (缓存层)   │     │  (持久层)   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴──────┐
                    │ 本地缓存     │
                    │ (Caffeine)  │
                    └────────────┘
`

### 4.2 多级缓存策略

| 缓存层级 | 存储 | TTL | 适用数据 |
|---------|------|-----|---------|
| L1 本地缓存 | Caffeine | 1-5 分钟 | 热点题目、科目列表、知识点树 |
| L2 Redis 缓存 | Redis Cluster | 15-60 分钟 | 题目详情、统计汇总、Session |
| L3 数据库 | MySQL | — | 全量数据，最终一致性保证 |

### 4.3 Redis 缓存设计

`ash
# ====== 缓存 Key 命名规范 ======
# 格式: {业务}:{实体}:{ID}:{字段}

# 题目缓存 (TTL: 3600s)
questions:{id}                    # 题目完整信息 (Hash)
questions:{id}:stats              # 题目答题统计 (Hash)

# 用户缓存 (TTL: 7200s)
user:{id}                         # 用户信息 (Hash)
user:{id}:session:{token}         # 登录会话 (String, TTL: 86400s)

# 知识点缓存 (TTL: 86400s)
knowledge:tree                    # 完整知识树 (String - JSON)

# 统计数据缓存 (TTL: 300s)
stats:user:{id}:dashboard         # 首页统计 (Hash)
stats:user:{id}:daily:{date}      # 每日统计 (Hash)

# 排行榜 (无过期, 定时更新)
leaderboard:accuracy              # 正确率排行榜 (ZSet)
leaderboard:streak                # 连续学习天数 (ZSet)

# 防重缓存
rate_limit:api:{ip}               # API 限流 (String, TTL: 1s)
dedup:answer:{user}:{qid}         # 答题防重 (String, TTL: 5s)
`

### 4.4 缓存更新策略

`
Cache-Aside Pattern:
  读: 先查 Redis → 命中返回 → 未命中查 DB → 写入 Redis → 返回
  写: 更新 DB → 删除 Redis 缓存 → (延迟双删) → 异步更新

热点数据预热:
  1. 启动时加载: 科目列表、知识点树 → 本地缓存
  2. 定时预热: Cron 扫描高频题目 → 刷新 Redis 缓存
  3. 穿透保护: Bloom Filter 过滤不存在 ID，防止缓存穿透

缓存雪崩防护:
  1. 过期时间加随机值 (base_TTL + random(0, 300))
  2. 本地缓存作为降级方案
  3. 互斥锁 (SETNX) 防止缓存并发重建
`

---

## 五、分库分表方案

### 5.1 何时分库分表

| 指标 | 阈值 | 措施 |
|------|------|------|
| 题目表数据量 | > 1000 万行 | 按年份或科目分表 |
| 答题记录数据量 | > 5000 万行 | 按用户 ID 分表 |
| QPS | > 5000 | 读写分离 + 分库 |
| 单库存储 | > 500 GB | 水平分片 |

### 5.2 分片策略

#### 5.2.1 题目表 — 按年份范围分片

`
questions_2020, questions_2021, questions_2022, questions_2023, ...
questions_archive (5年前的老题)

路由规则:
  year ≤ 2020 → questions_archive
  year = 2021 → questions_2021
  year = 2022 → questions_2022
  ...

查询时:
  SELECT * FROM questions_{year} WHERE ...
  跨年查询: UNION ALL 多个分表
`

#### 5.2.2 用户数据表 — 按 user_id 哈希分片

`
分片数量: 16 (2^4) 或 64 (2^6)
分片算法: user_id % 16

user_answers_0  ~ user_answers_15
wrong_questions_0 ~ wrong_questions_15
exam_records_0  ~ exam_records_15

查询路由:  user_id % 16 → 定位到具体分片
`

#### 5.2.3 分库方案

`
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  db_master_0  │  │  db_master_1  │  │  db_master_2  │
│  (用户类数据)  │  │  (题目类数据)  │  │  (统计分析)   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ users        │  │ questions_*   │  │ study_stats  │
│ user_answers │  │ options       │  │ audit_logs   │
│ wrong_*      │  │ knowledge_*   │  │             │
│ favorites    │  │ q_knowledge   │  │             │
│ notes        │  │ versions      │  │             │
│ exams        │  │               │  │             │
│ exam_records │  │               │  │             │
└──────────────┘  └──────────────┘  └──────────────┘
     │                   │                  │
     └───────────────────┼──────────────────┘
                         │
                    ┌────┴────┐
                    │ Proxy   │
                    │ (ShardingSphere/
                    │  MyCat)  │
                    └─────────┘
`

### 5.3 读写分离

`yaml
# ShardingSphere 配置示例
dataSources:
  ds_master_0:
    url: jdbc:mysql://192.168.1.1:3306/tcm_0
  ds_slave_0_0:
    url: jdbc:mysql://192.168.1.2:3306/tcm_0
  ds_slave_0_1:
    url: jdbc:mysql://192.168.1.3:3306/tcm_0

rules:
  - !READWRITE_SPLITTING
    dataSourceGroups:
      ds_0:
        writeDataSourceName: ds_master_0
        readDataSourceNames: [ds_slave_0_0, ds_slave_0_1]
        loadBalancerName: round_robin

  - !SHARDING
    tables:
      user_answers:
        actualDataNodes: ds_.user_answers_
        tableStrategy:
          standard:
            shardingColumn: user_id
            shardingAlgorithmName: user_id_mod
        databaseStrategy:
          standard:
            shardingColumn: user_id
            shardingAlgorithmName: user_id_db_mod
`

### 5.4 MySQL 配置优化

`ini
# my.cnf 百万级题库优化配置
[mysqld]
# InnoDB
innodb_buffer_pool_size = 8G          # 物理内存的 60-70%
innodb_log_file_size = 2G
innodb_flush_log_at_trx_commit = 2     # 0=最快 1=最安全 2=折中
innodb_io_capacity = 2000
innodb_autoinc_lock_mode = 2           # 性能更好

# 连接
max_connections = 2000
max_connect_errors = 100000
interactive_timeout = 600
wait_timeout = 300

# 查询缓存 (MySQL 8.0 已弃用, 使用 Redis 替代)
# 全文搜索
ngram_token_size = 2                    # 中文分词粒度
ft_min_word_len = 1

# 临时表
tmp_table_size = 256M
max_heap_table_size = 256M
`

---

## 六、扩展性与高可用

### 6.1 垂直扩展

`
1. 数据库垂直拆分 → 3 个实例（用户/题目/统计）
2. 读写分离 → 1 主 N 从，从库用于查询和报表
3. 连接池优化 → HikariCP（最大 50，最小 10）
`

### 6.2 水平扩展

`
1. 题目表按年份分表 → 每年 1 张表，老数据归档
2. 用户数据按 user_id 哈希分片 → 16/64 片
3. 引入 Elasticsearch → 替代 MySQL 全文检索
`

### 6.3 数据归档策略

`sql
-- 每季度执行一次
-- 1. 3年前的答题记录移入归档库
INSERT INTO archive.user_answers_2023
SELECT * FROM user_answers
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 YEAR)
  AND id % 100 = 0;  -- 分批删除

-- 2. 5年前的题目移入归档表
INSERT INTO questions_archive
SELECT * FROM questions
WHERE year < YEAR(NOW()) - 5;

-- 3. 聚合统计表保留无限期，原始答题记录定期清理
`

### 6.4 高可用架构

`
                 ┌─────────────┐
                 │  Nginx/LVS   │
                 │  (负载均衡)   │
                 └──────┬──────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
    ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
    │  API-1    │ │  API-2    │ │  API-3    │
    └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
          │             │             │
          └─────────────┼─────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
    ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
    │  Redis     │ │  MySQL    │ │  ES Cluster│
    │  Cluster   │ │  MGR      │ │            │
    └───────────┘ └───────────┘ └────────────┘
`

---

> 本文档配合项目代码持续更新。数据库变更采用 Flyway/Liquibase 进行版本化管理。
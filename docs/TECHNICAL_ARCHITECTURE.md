# 杏林题库 — 技术方案设计文档

> 版本：v1.0 | 架构：Next.js + NestJS + PostgreSQL + Redis + Elasticsearch + Kubernetes
> 目标：百万级题库 · 十万级用户 · 高并发刷题 · 自动弹性伸缩

---

## 一、技术选型理由

### 1.1 前端：Next.js + TypeScript + Tailwind CSS

| 技术 | 选型理由 |
|------|---------|
| **Next.js** | SSR/SSG 双重能力：题库页面 SSG 预渲染实现极速首屏，用户中心 SSR 保障个性化内容；内置路由、API Routes、中间件、图片优化，减少基建成本；App Router 支持布局嵌套、流式加载、React Server Components 零 JS 开销 |
| **TypeScript** | 全栈共享类型（API 请求/响应体、数据库模型 → 前端类型生成），消除前后端类型不一致 |
| **Tailwind CSS** | 原子化 CSS 零运行时开销，PurgeCSS 构建后仅剩用到的样式（<10KB），响应式断点内联设计 |

### 1.2 后端：NestJS

| 特性 | 优势 |
|------|------|
| **模块化架构** | 按业务域拆分为 QuestionModule、ExamModule、UserModule 等，每个模块独立部署/扩展 |
| **依赖注入** | 天然适合领域驱动设计，Service/Repository 分层清晰 |
| **TypeORM 集成** | 与 PostgreSQL 深度整合，支持 Entity → Migration 自动生成 |
| **装饰器体系** | @Controller、@Get、@Body 声明式路由，@Auth 自定义装饰器统一鉴权 |
| **微服务支持** | TCP/RabbitMQ/Kafka 传输层，可平滑演进为微服务架构 |

### 1.3 数据库：PostgreSQL

| 能力 | 说明 |
|------|------|
| **JSON/JSONB** | questions.extra_data、exam_records.answers 等扩展字段直接存 JSONB，支持 GIN 索引内查询 |
| **全文搜索** | 内置 ngram 分词器，百万级满足日常搜索，超量后再上 ES |
| **递归 CTE** | 知识点树结构查询天然支持：WITH RECURSIVE 一次查出子树 |
| **并行查询** | PostgreSQL 14+ 支持多核并行扫描，分析报表查询加速 |

### 1.4 缓存：Redis

| 场景 | 使用方式 |
|------|---------|
| 热点题目 | String/JSON 缓存，TTL 1h |
| 用户 Session | 替代 JWT 黑名单，Redis 存储态 Session |
| Rate Limiter | INCR + EXPIRE 实现滑动窗口限流 |
| 排行榜 | ZSet 存储用户正确率/连续学习天数排序 |
| 分布式锁 | SETNX 防止答题记录重复提交 |

### 1.5 搜索：Elasticsearch

- 替代 MySQL 全文索引（百万级后性能衰减明显）
- 支持同义词扩展（"桂枝"="肉桂" 同义搜索）
- 支持拼音搜索（"mahuang"→"麻黄"）
- 搜索结果高亮、聚合统计、联想补全

### 1.6 对象存储：S3

- 用户头像
- 题目图片/图表（解剖图、舌象图、穴位图）
- 批量导入文件（Excel/CSV 模板）
- 学习报告 PDF 导出

### 1.7 部署：Docker + Kubernetes

- 每个微服务独立容器化
- K8s HPA 按 CPU/内存/自定义指标自动扩缩容
- Ingress + Cert-Manager 统一 HTTPS
- Helm Chart 管理所有组件

---

## 二、系统架构图

### 2.1 整体架构

`
┌─────────────────────────────────────────────────────────────────────────┐
│                          CDN (Cloudflare)                                │
│         静态资源加速 · 边缘缓存 · DDoS 防护 · WAF                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                      Load Balancer (ALB / Nginx)                         │
│                 SSL Termination · 路由分发 · 健康检查                      │
└──────────────┬───────────────────────────┬──────────────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Next.js (Server)       │   │  NestJS API Gateway       │
│   ┌──────────────────┐   │   │  ┌────────────────────┐   │
│   │  SSG: 题库页面    │   │   │  │  Auth Middleware   │   │
│   │  SSR: 用户中心    │   │   │  │  Rate Limiter     │   │
│   │  RSC: 题目组件    │   │   │  │  Request Validate  │   │
│   │  API Routes: 代理  │   │   │  │  Logging           │   │
│   └──────────────────┘   │   │  └────────────────────┘   │
│   Next.js Server         │   │        │                   │
│   ─── Auto-scale HPA     │   │        ▼                   │
└──────────────────────────┘   │  ┌────────────────────┐   │
                               │  │  WebSocket Gateway   │   │
                               │  │  (刷题实时推送)      │   │
                               │  └────────────────────┘   │
                               └───────────┬───────────────┘
                                           │
                  ┌────────────────────────┼────────────────────────┐
                  ▼                        ▼                        ▼
       ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
       │ Question Service   │  │ Exam Service        │  │ User Service        │
       │ 题目CRUD           │  │ 刷题/模拟考/组卷    │  │ 用户/会员/统计      │
       │ 版本管理           │  │ 错题本/收藏         │  │ 学习报告            │
       │ 导入导出           │  │ 笔记               │  │                    │
       │ ES 同步            │  │                    │  │                    │
       └────────┬───────────┘  └────────┬───────────┘  └────────┬───────────┘
                │                       │                       │
                └───────────┬───────────┘                       │
                            │                                   │
                            ▼                                   │
               ┌────────────────────────┐                       │
               │  PostgreSQL Cluster     │◄──────────────────────┘
               │  (Patroni + PgBouncer)   │
               │  ┌─────┐ ┌─────┐ ┌─────┐│
               │  │Primary│ Replica1 │Replica2│
               │  └──┬──┘ └──┬──┘ └──┬──┘│
               │     │       │        │   │
               └─────┼───────┼────────┼───┘
                     │       │        │
                     ▼       ▼        ▼
               ┌────────────────────────┐
               │   Redis Cluster         │
               │  Session · Cache · Queue│
               └────────────────────────┘

       ┌────────────────────┐  ┌────────────────────┐
       │  Elasticsearch      │  │  S3 (MinIO/OSS)    │
       │  题库全文搜索        │  │  图片/文件/导出    │
       │  同义词/拼音搜索     │  │                    │
       └────────────────────┘  └────────────────────┘

       ┌────────────────────────────────────────────┐
       │  监控 & 可观测                              │
       │  Prometheus → Grafana · ELK · Sentry        │
       │  k8s 事件告警 · 慢 SQL 追踪 · 业务指标看板   │
       └────────────────────────────────────────────┘
`

### 2.2 容器化架构

`
┌──────────────────────────────────────────────────────┐
│  Kubernetes Cluster (EKS/ACK)                         │
├──────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐   │
│ │ ns:prod   │ │ ns:staging│ │  Infrastructure       │   │
│ ├──────────┤ ├──────────┤ ├──────────────────────┤   │
│ │nextjs    │ │nest-ques │ │  postgres-operator    │   │
│ │nest-exam │ │nest-user │ │  redis-operator       │   │
│ │nest-gate │ │           │ │  es-operator          │   │
│ └──────────┘ └──────────┘ │  cert-manager         │   │
│                           │  ingress-nginx        │   │
│ ┌──────────┐             │  prometheus-operator  │   │
│ │ HPA      │             │  fluentd               │   │
│ │ VPA      │             └──────────────────────┘   │
│ │ PDB      │                                        │
│ └──────────┘                                        │
└──────────────────────────────────────────────────────┘
`

---

## 三、接口设计规范

### 3.1 统一规范

`
基础路径: /api/v1
响应格式:
  {
    "code": 200,            // 业务状态码
    "message": "success",   // 提示信息
    "data": {},             // 业务数据
    "meta": {               // 分页/元信息
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }

状态码规范:
  200 - 成功
  201 - 创建成功
  400 - 请求参数错误
  401 - 未登录/Token过期
  403 - 无权限
  404 - 资源不存在
  409 - 资源冲突
  422 - 校验失败
  429 - 请求频率限制
  500 - 服务器内部错误
`

### 3.2 核心接口列表

#### 题目模块 /api/v1/questions

`
GET    /questions                   查询题目列表
       ?subject=中医基础理论
       &year=2023
       &difficulty=3
       &knowledgePoint=tcm-basic/yin-yang
       &type=single
       &keyword=阴阳
       &page=1&pageSize=20

GET    /questions/:id               题目详情（含选项+解析）

POST   /questions                   新增题目（编辑角色）
POST   /questions/batch-import      批量导入（Excel/CSV/JSON）
PUT    /questions/:id               更新题目（生成新版本）
GET    /questions/:id/versions      版本历史
POST   /questions/:id/review        审核题目（审核员角色）

GET    /questions/random            随机抽题
       ?count=10
       &subject=中医内科学

POST   /questions/generate-paper    智能组卷
       Body: { subject, difficulty, knowledgePoints, count }
`

#### 刷题模块 /api/v1/practice

`
POST   /practice/submit             提交答案
       Body: { questionId, selectedAnswer, timeSpent }
       Response: { isCorrect, correctAnswer, explanation }

GET    /practice/history            答题历史
       ?dateFrom=2024-01-01
       &dateTo=2024-12-31
       &subject=方剂学
`

#### 错题模块 /api/v1/wrong

`
GET    /wrong                       错题列表
       ?status=reviewing
       &subject=针灸学
       &dateFrom=2024-01-01

PUT    /wrong/:id/mastery           更新掌握状态
       Body: { masteryStatus: "mastered" }

POST   /wrong/export                导出错题
       Body: { format: "pdf", subject: "中基" }
`

#### 考试模块 /api/v1/exams

`
GET    /exams                       模拟考试列表
POST   /exams                       创建模拟考试
GET    /exams/:id                   考试详情
POST   /exams/:id/start             开始考试
POST    /exams/:id/submit           提交答卷
GET    /exams/records               考试历史
GET    /exams/records/:id           考试详情（含逐题分析）
`

#### 用户模块 /api/v1/auth & /api/v1/users

`
POST   /auth/register               注册
POST   /auth/login                  登录
POST   /auth/refresh                刷新Token
POST   /auth/logout                 登出

GET    /users/me                    当前用户信息
PUT    /users/me                    更新个人信息
GET    /users/me/stats              学习统计
GET    /users/me/stats/dashboard    首页总览
GET    /users/me/stats/analysis     考试分析
`

### 3.3 筛选/排序/分页规范

`	ypescript
// 分页参数 (Query)
interface PaginationParams {
  page: number     // 默认 1
  pageSize: number // 默认 20, 最大 100
  sortBy: string   // 字段名
  sortOrder: 'ASC' | 'DESC'
}

// 筛选参数
interface FilterParams {
  subject?: string | string[]
  year?: number | number[]
  difficulty?: 1 | 2 | 3 | 4 | 5
  type?: 'single' | 'multiple' | 'a1' | 'a2' | 'b1' | 'case'
  keyword?: string             // 全文搜索
  knowledgePoint?: string | string[]  // 知识点 ID 数组
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  dateFrom?: string  // ISO 日期
  dateTo?: string
}
`

---

## 四、安全方案

### 4.1 认证与授权

`
认证方案: JWT (Access Token) + Refresh Token
  Access Token:  15分钟过期, 存储在内存/HTTP-Only Cookie
  Refresh Token: 7天过期, 存储在 Redis (可撤销)
  Token 刷新: 自动静默刷新, 前端 Axios 拦截器实现

授权方案: RBAC (Role-Based Access Control)
  角色: student | editor | reviewer | admin | super_admin
  权限装饰器: @RequireRole('editor')
  资源隔离: 用户级数据自动注入 userId 过滤

OAuth 集成:
  WeChat / 微信扫码登录 (可选)
`

### 4.2 API 安全

`
速率限制 (Rate Limiting):
  登录:    5次/分钟/IP
  注册:    3次/小时/IP
  刷题提交: 60次/分钟/用户
  通用API: 120次/分钟/用户

请求校验:
   输入: class-validator DTO 校验 (禁止 XSS/SQL注入)
   CSRF: Double Submit Cookie 模式
   CORS: 白名单域名限制
   HTTPS: 强制 TLS 1.3

敏感操作:
  密码: bcrypt (cost=12) 哈希
  二次确认: 修改手机/邮箱需验证码
  审计日志: 所有敏感操作记录 audit_logs
`

### 4.3 数据安全

`
传输加密:
  全站 HTTPS (TLS 1.3)
  API 请求签名 (可选)

存储加密:
  密码: bcrypt 不可逆哈希
  Token: JWT RS256 签名
  数据库: 敏感列 AES-256 加密 (pgcrypto)
  S3: 服务端 SSE-S3 加密

隐私合规:
  用户数据导出 (GDPR 合规)
  账号注销: 物理删除个人数据
  数据脱敏: 日志中手机号/邮箱脱敏显示
`

### 4.4 基础设施安全

`
网络:
  集群内: mTLS 服务间通信
  集群外: Ingress 统一网关
  数据库: 私有子网, 仅允许 API 服务连接

容器:
  镜像: Trivy 漏洞扫描
  运行时: Pod Security Policy
  密钥: External Secrets Operator 从 Vault 同步

监控告警:
  入侵检测: Falco 容器运行时安全
  WAF: ModSecurity / Cloudflare WAF
  DDoS: Cloudflare 防护
`

---

## 五、性能优化方案

### 5.1 前端性能

`
首屏加载:
  - SSG: 题库列表页构建时预生成静态 HTML，CDN 分发
  - ISR: 题库详情页增量静态再生，60s 重新验证
  - RSC: 题目渲染组件零客户端 JS 开销
  - 图片: Next.js Image 组件自动 WebP/AVIF、懒加载

运行时:
  - React Server Components 减少客户端 Bundle
  - Streaming SSR: 页面分块流式渲染，优先展示骨架屏
  - Route Prefetch: 悬停链接时预加载页面数据
  - 数据缓存: useSWR 全局缓存 API 响应

构建优化:
  - Code Splitting: 每个页面独立 Chunk
  - Tree Shaking: lodash、moment 等库按需导入
  - Bundle 分析: 每次构建生成分析报告
`

### 5.2 后端性能

`
数据库优化:
  - 连接池: PgBouncer 事务级连接池，最大 200 连接
  - 读写分离: 写 Primary + 读 Replica × 2
  - 查询优化: TypeORM 查询缓存 + 手写 SQL 热点路径
  - 分页优化: Keyset Pagination (WHERE id > :last) 替代 OFFSET
  - 批量操作: COPY 命令批量导入题目，比 INSERT 快 10 倍

缓存策略:
  - L1: Node.js 进程内 LRU 缓存 (hot-question)
  - L2: Redis Cluster 缓存 (question:{id})
  - 缓存穿透: Bloom Filter 拦截不存在 ID
  - 缓存雪崩: 过期时间添加随机偏移 ±30%

并发处理:
  - 刷题提交: 异步写入 + Redis 队列，避免数据库写压力
  - 统计聚合: 定时任务 Redis 内存中聚合，批量写 DB
  - 热点题目: 本地缓存 + Redis 双重缓存

Node.js 优化:
  - Cluster Mode: PM2 启动多进程，充分利用多核 CPU
  - 请求合并: 批量查询使用 DataLoader 避免 N+1
  - 内存管理: 大对象(题目内容)避免重复序列化
  - 日志: pino JSON 日志，异步写入
`

### 5.3 数据库查询优化示例

`sql
-- ❌ 错误: OFFSET 分页 (百万级后越来越慢)
SELECT * FROM questions WHERE subject = '中医基础理论'
ORDER BY id LIMIT 20 OFFSET 1000000;

-- ✅ 正确: Keyset Pagination (始终使用索引)
SELECT * FROM questions
WHERE subject = '中医基础理论' AND id > 1000000
ORDER BY id LIMIT 20;

-- ❌ 错误: 循环查知识点
-- for (const q of questions) { await findKnowledge(q.id) }

-- ✅ 正确: 批量查询
SELECT qk.*, kp.name
FROM question_knowledge qk
JOIN knowledge_points kp ON kp.id = qk.knowledge_id
WHERE qk.question_id = ANY(:questionIds);

-- 知识点树查询 (PostgreSQL 递归 CTE)
WITH RECURSIVE kp_tree AS (
  SELECT id, name, parent_id, 1 AS depth
  FROM knowledge_points
  WHERE parent_id IS NULL
  UNION ALL
  SELECT kp.id, kp.name, kp.parent_id, kt.depth + 1
  FROM knowledge_points kp
  JOIN kp_tree kt ON kp.parent_id = kt.id
)
SELECT * FROM kp_tree ORDER BY depth, id;
`

### 5.4 弹性伸缩

`yaml
# Kubernetes HPA 配置
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: exam-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nest-exam
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: 500
`

---


`
┌──────────────────┬────────────────┬────────────────┬──────────────────┐
│    备份类型       │    频率         │    保留时间      │    存储位置       │
## 六、数据备份方案

### 6.1 备份策略

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|---------|------|---------|---------|
| 全量备份 (pg_dump) | 每日 03:00 | 30 天 | S3 (数据库备份桶) |
| WAL 归档 | 连续 | 7 天 | S3 (WAL 归档桶) |
| 增量备份 | 每 6 小时 | 14 天 | S3 |
| 逻辑备份(题目表) | 每周日 22:00 | 90 天 | S3 (冷存储) |
| 配置备份 | 每次变更时 | 永久保留 | Git + S3 |
| ES 快照 | 每日 04:00 | 7 天 | S3 |

### 6.2 备份脚本核心逻辑

```bash
# 1. 全量备份: pg_dump -h $PG_HOST -Fc -j 4 -Z 6 -f backup.dump
# 2. 加密上传: gpg + aws s3 cp to S3
# 3. 保留策略: aws s3 ls | while read; remove files older than 30 days
```

### 6.3 灾备恢复

| 恢复等级 | RTO | RPO |
|---------|-----|-----|
| 热备 (Primary -> Replica) | < 30秒 | < 1秒 |
| 温备 (备份恢复) | < 2小时 | < 24小时 |
| 冷备 (归档恢复) | < 24小时 | < 7天 |

恢复流程:
1. 检测到 Primary 故障 -> 自动切换 Replica
2. 新 Replica 从 S3 拉取 WAL 归档追平数据
3. 全部失败 -> 从最近全量备份恢复

演练计划:
- 每月: 从备份恢复验证数据完整性
- 每季: 模拟 Primary 故障测试自动切换
- 每年: 完整灾备演练

### 6.4 数据完整性验证

```sql
-- 行数校验
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM user_answers;

-- 外键完整性
SELECT COUNT(*) FROM user_answers ua LEFT JOIN questions q ON q.id = ua.question_id WHERE q.id IS NULL;

-- 校验和检查
SELECT SUM(CRC32(CONCAT(id, question_type))) FROM questions WHERE deleted_at IS NULL;
```

---

> 本文档随项目开发持续更新。

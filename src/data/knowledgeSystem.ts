// ============================================================
// 杏林题库 — 中医执业医师考试完整知识体系
// 依据最新中医执业医师资格考试大纲编制
// ============================================================

export interface KnowledgeNode {
  id: string
  name: string
  level: number
  children?: KnowledgeNode[]
  highFreqPoints?: string[]
  easyMistakes?: string[]
}

// ---- 辅助函数：展平知识树为 id->name 映射 ----
export function flattenKnowledgeTree(
  nodes: KnowledgeNode[],
  prefix = ""
): Map<string, string> {
  const map = new Map<string, string>()
  for (const node of nodes) {
    const fullName = prefix ? prefix + " > " + node.name : node.name
    map.set(node.id, fullName)
    if (node.children) {
      const childMap = flattenKnowledgeTree(node.children, fullName)
      childMap.forEach((v, k) => map.set(k, v))
    }
  }
  return map
}

// ---- 辅：获取所有叶节点（最终知识点） ----
export function getLeafNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const leaves: KnowledgeNode[] = []
  function walk(list: KnowledgeNode[]) {
    for (const n of list) {
      if (!n.children || n.children.length === 0) {
        leaves.push(n)
      } else {
        walk(n.children)
      }
    }
  }
  walk(nodes)
  return leaves
}

// ---- 辅：按 ID 查找节点 ----
export function findNodeById(
  nodes: KnowledgeNode[],
  id: string
): KnowledgeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return undefined
}

// ============================================================
// 知识体系主数据
// ============================================================
export const knowledgeSystem: KnowledgeNode[] = [
  // ==========================================================
  // 1. 中医基础理论
  // ==========================================================
  {
    id: "tcm-basic",
    name: "中医基础理论",
    level: 1,
    children: [
      {
        id: "tcm-basic/yin-yang",
        name: "阴阳学说",
        level: 2,
        children: [
          { id: "tcm-basic/yin-yang/concept", name: "阴阳的基本概念", level: 3, highFreqPoints: ["阴阳的属性特征", "阴阳的无限可分性"], easyMistakes: ["阴阳属性相对性与绝对性混淆"] },
          { id: "tcm-basic/yin-yang/content", name: "阴阳学说的基本内容", level: 3, highFreqPoints: ["阴阳对立制约", "阴阳互根互用", "阴阳消长平衡", "阴阳相互转化"], easyMistakes: ["互根互用与消长平衡的关系混淆", "\"阴在内阳之守\"的临床意义"] },
          { id: "tcm-basic/yin-yang/application", name: "阴阳学说在中医学的应用", level: 3, highFreqPoints: ["说明脏腑功能", "指导疾病诊断", "确定治疗原则", "归纳药物性能"], easyMistakes: ["阳虚则寒与阴盛则寒的鉴别", "\"阳病治阴\"的临床应用"] },
        ],
      },
      {
        id: "tcm-basic/five-elements",
        name: "五行学说",
        level: 2,
        children: [
          { id: "tcm-basic/five-elements/concept", name: "五行的基本概念与特性", level: 3, highFreqPoints: ["木曰曲直", "火曰炎上", "土爰稼穑", "金曰从革", "水曰润下"], easyMistakes: ["五行特性记忆混淆"] },
          { id: "tcm-basic/five-elements/content", name: "五行学说的基本内容", level: 3, highFreqPoints: ["五行相生相克", "五行制化", "五行相乘相侮", "母子相及"], easyMistakes: ["相克与相乘的关系", "相生与母子关系对应错误"] },
          { id: "tcm-basic/five-elements/application", name: "五行学说在中医的应用", level: 3, highFreqPoints: ["说明五脏的生理联系", "说明五脏病变传变", "指导疾病诊断", "确定治则治法"], easyMistakes: ["培土生金、滋水涵木等治法对应错误"] },
        ],
      },
      {
        id: "tcm-basic/zangxiang",
        name: "藏象",
        level: 2,
        children: [
          { id: "tcm-basic/zangxiang/heart", name: "心", level: 3, highFreqPoints: ["心主血脉", "心藏神", "心在志为喜", "心在体合脉", "心开窍于舌", "汗为心之液"], easyMistakes: ["心主血脉与心藏神的关系", "\"五脏六腑之大主\"的理解"] },
          { id: "tcm-basic/zangxiang/lung", name: "肺", level: 3, highFreqPoints: ["肺主气司呼吸", "肺主宣发肃降", "肺通调水道", "肺朝百脉", "肺在志为悲", "肺开窍于鼻", "肺在体合皮"], easyMistakes: ["宣发与肃降的功能区别", "\"华盖\"\"娇脏\"的理解"] },
          { id: "tcm-basic/zangxiang/spleen", name: "脾", level: 3, highFreqPoints: ["脾主运化", "脾主升清", "脾主统血", "脾在志为思", "脾在体合肉", "脾开窍于口"], easyMistakes: ["脾主运化的具体内涵", "\"后天之本\"\"气血生化之源\"的理解"] },
          { id: "tcm-basic/zangxiang/liver", name: "肝", level: 3, highFreqPoints: ["肝主疏泄", "肝藏血", "肝在志为怒", "肝在体合筋", "肝开窍于目", "肝其华在爪"], easyMistakes: ["肝主疏泄的三大功能", "肝与女子月经、男子排精的关系"] },
          { id: "tcm-basic/zangxiang/kidney", name: "肾", level: 3, highFreqPoints: ["肾藏精", "肾主水", "肾主纳气", "肾在志为恐", "肾在体合骨", "肾开窍于耳及二阴"], easyMistakes: ["肾阴与肾阳的功能区别", "\"先天之本\"的理解", "肾主纳气的机理"] },
          { id: "tcm-basic/zangxiang/six-fu", name: "六腑", level: 3, highFreqPoints: ["胆主决断", "胃主受纳腐熟", "小肠泌别清浊", "大肠传化糟粕", "膀胱贮尿排尿", "三焦通行元气"], easyMistakes: ["六腑\"泻而不藏\"的特点", "三焦的形态与功能认识"] },
          { id: "tcm-basic/zangxiang/extraordinary", name: "奇恒之腑", level: 3, highFreqPoints: ["脑为髓海", "女子胞的生理功能"], easyMistakes: ["奇恒之腑的形态似腑功能似脏"] },
        ],
      },
      {
        id: "tcm-basic/qi-blood",
        name: "气血津液",
        level: 2,
        children: [
          { id: "tcm-basic/qi-blood/qi", name: "气", level: 3, highFreqPoints: ["气的生成", "气的功能", "气的运动", "气的分类"], easyMistakes: ["元气、宗气、营气、卫气的功能区别", "气机失调的几种形式"] },
          { id: "tcm-basic/qi-blood/blood", name: "血", level: 3, highFreqPoints: ["血的生成", "血的运行", "血的功能"], easyMistakes: ["心肝脾对血的生成运行的协同作用"] },
          { id: "tcm-basic/qi-blood/fluid", name: "津液", level: 3, highFreqPoints: ["津液的代谢", "津液的功能"], easyMistakes: ["津与液的区别"] },
          { id: "tcm-basic/qi-blood/relation", name: "气血津液的关系", level: 3, highFreqPoints: ["气为血之帅", "血为气之母", "气能生津", "津血同源"], easyMistakes: ["气能行血、气能摄血的功能区别", "\"津血同源\"对临床的指导意义"] },
        ],
      },
      {
        id: "tcm-basic/meridian",
        name: "经络",
        level: 2,
        children: [
          { id: "tcm-basic/meridian/overview", name: "经络系统概述", level: 3, highFreqPoints: ["经络系统的组成", "经络的生理功能"], easyMistakes: ["经脉与络脉的区别"] },
          { id: "tcm-basic/meridian/twelve", name: "十二经脉", level: 3, highFreqPoints: ["十二经脉命名", "走向交接规律", "分布规律", "表里关系", "流注次序"], easyMistakes: ["手足三阴三阳的对应关系", "流注次序记忆"] },
          { id: "tcm-basic/meridian/extra", name: "奇经八脉", level: 3, highFreqPoints: ["督脉", "任脉", "冲脉", "带脉", "跷脉", "维脉"], easyMistakes: ["奇经八脉\"别道奇行\"的特点", "\"十二经之海\"\"血海\"对应"] },
        ],
      },
      {
        id: "tcm-basic/etiology",
        name: "病因",
        level: 2,
        children: [
          { id: "tcm-basic/etiology/six-excess", name: "外感六淫", level: 3, highFreqPoints: ["风邪的性质及致病特点", "寒邪的性质及致病特点", "暑邪的性质及致病特点", "湿邪的性质及致病特点", "燥邪的性质及致病特点", "火邪的性质及致病特点"], easyMistakes: ["六淫各自致病特点的鉴别", "\"风为百病之长\"的理解"] },
          { id: "tcm-basic/etiology/seven-emotions", name: "内伤七情", level: 3, highFreqPoints: ["七情与五脏的对应关系", "七情致病的特点"], easyMistakes: ["怒伤肝、喜伤心等对应关系"] },
          { id: "tcm-basic/etiology/others", name: "饮食劳逸、痰饮瘀血", level: 3, highFreqPoints: ["饮食不节的致病特点", "劳逸失度的致病特点", "痰饮的概念与致病特点", "瘀血的概念与致病特点"], easyMistakes: ["痰饮与瘀血的致病特点鉴别"] },
        ],
      },
      {
        id: "tcm-basic/pathogenesis",
        name: "发病与病机",
        level: 2,
        children: [
          { id: "tcm-basic/pathogenesis/principle", name: "发病原理", level: 3, highFreqPoints: ["正气与邪气的概念", "正邪交争与发病的关系"], easyMistakes: ["正气的主导作用理解"] },
          { id: "tcm-basic/pathogenesis/basic", name: "基本病机", level: 3, highFreqPoints: ["邪正盛衰", "阴阳失调", "气血失常", "津液代谢失常"], easyMistakes: ["阴阳偏盛偏衰的临床表现区分", "虚实真假的鉴别"] },
        ],
      },
      {
        id: "tcm-basic/treatment",
        name: "防治原则",
        level: 2,
        children: [
          { id: "tcm-basic/treatment/prevention", name: "预防", level: 3, highFreqPoints: ["未病先防", "既病防变"], easyMistakes: ["治未病的具体内涵"] },
          { id: "tcm-basic/treatment/principles", name: "治则", level: 3, highFreqPoints: ["治病求本", "正治与反治", "治标与治本", "扶正与祛邪", "调整阴阳", "三因制宜"], easyMistakes: ["正治与反治的概念区分", "\"热因热用\"\"寒因寒用\"的临床应用"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 2. 中医诊断学
  // ==========================================================
  {
    id: "tcm-diag",
    name: "中医诊断学",
    level: 1,
    children: [
      {
        id: "tcm-diag/inspection",
        name: "望诊",
        level: 2,
        children: [
          { id: "tcm-diag/inspection/body", name: "全身望诊", level: 3, highFreqPoints: ["望神（得神、失神、假神）", "望色（五色主病）", "望形", "望态"], easyMistakes: ["假神与病情好转的鉴别", "五色主病的对应关系"] },
          { id: "tcm-diag/inspection/local", name: "局部望诊", level: 3, highFreqPoints: ["望头面五官", "望躯体", "望皮肤", "望排出物"], easyMistakes: ["目部五脏分属"] },
          { id: "tcm-diag/inspection/tongue", name: "望舌", level: 3, highFreqPoints: ["舌诊原理与方法", "望舌质（神、色、形、态）", "望舌苔（苔质、苔色）", "舌象分析要点及临床意义"], easyMistakes: ["淡白舌、红舌、绛舌、青紫舌的主病", "薄厚苔、润燥苔、腻腐苔、剥苔的区分", "舌象变化与病证关系"] },
          { id: "tcm-diag/inspection/children", name: "望小儿指纹", level: 3, highFreqPoints: ["三关测轻重", "浮沉分表里", "红紫辨寒热", "淡滞定虚实"], easyMistakes: ["指纹的临床意义判断"] },
        ],
      },
      {
        id: "tcm-diag/auscultation",
        name: "闻诊",
        level: 2,
        children: [
          { id: "tcm-diag/auscultation/sound", name: "听声音", level: 3, highFreqPoints: ["语声", "呼吸", "咳嗽", "呕吐", "呃逆嗳气"], easyMistakes: ["谵语与郑声的鉴别", "哮与喘的鉴别"] },
          { id: "tcm-diag/auscultation/smell", name: "嗅气味", level: 3, highFreqPoints: ["病体气味", "病室气味"], easyMistakes: ["口气、汗气、痰涕气味的辨证意义"] },
        ],
      },
      {
        id: "tcm-diag/inquiry",
        name: "问诊",
        level: 2,
        children: [
          { id: "tcm-diag/inquiry/ten-items", name: "十问歌", level: 3, highFreqPoints: ["一问寒热二问汗", "三问头身四问便", "五问饮食六胸腹", "七聋八渴俱当辨", "九问旧病十问因"], easyMistakes: ["十问歌顺序记忆"] },
          { id: "tcm-diag/inquiry/details", name: "问诊内容", level: 3, highFreqPoints: ["问寒热（恶寒发热、但寒不热、但热不寒）", "问汗（自汗、盗汗、绝汗、战汗）", "问疼痛（性质、部位）", "问饮食口味", "问二便", "问睡眠", "问经带"], easyMistakes: ["自汗与盗汗的区别", "不同热型的临床意义", "疼痛性质的辨证意义"] },
        ],
      },
      {
        id: "tcm-diag/palpation",
        name: "切诊",
        level: 2,
        children: [
          { id: "tcm-diag/palpation/pulse", name: "脉诊", level: 3, highFreqPoints: ["寸口脉诊法", "正常脉象", "28种病脉的特征与主病", "相兼脉", "真脏脉"], easyMistakes: ["浮沉迟数虚实六大脉的区分", "洪脉与细脉、滑脉与涩脉的鉴别", "促结代脉的鉴别"] },
          { id: "tcm-diag/palpation/palpation", name: "按诊", level: 3, highFreqPoints: ["按胸胁", "按脘腹", "按肌肤", "按手足", "按腧穴"], easyMistakes: ["腹部按诊：痞满、结胸的鉴别"] },
        ],
      },
      {
        id: "tcm-diag/syndrome-diff",
        name: "辨证",
        level: 2,
        children: [
          { id: "tcm-diag/syndrome-diff/bagang", name: "八纲辨证", level: 3, highFreqPoints: ["表里辨证", "寒热辨证", "虚实辨证", "阴阳辨证", "八纲之间的关系"], easyMistakes: ["寒热真假、虚实真假的鉴别", "表证与里证的鉴别要点"] },
          { id: "tcm-diag/syndrome-diff/zangfu", name: "脏腑辨证", level: 3, highFreqPoints: ["心与小肠病辨证", "肺与大肠病辨证", "脾与胃病辨证", "肝与胆病辨证", "肾与膀胱病辨证", "脏腑兼证辨证"], easyMistakes: ["心气虚与心阳虚鉴别", "脾气虚各证型鉴别", "肝气郁结与肝火上炎鉴别", "脏腑兼证的传变规律"] },
          { id: "tcm-diag/syndrome-diff/qi-blood", name: "气血津液辨证", level: 3, highFreqPoints: ["气病辨证", "血病辨证", "气血同病辨证", "津液病辨证"], easyMistakes: ["气虚与气陷的鉴别", "血虚与血瘀的鉴别", "津液不足与水液停聚的鉴别"] },
          { id: "tcm-diag/syndrome-diff/six-meridian", name: "六经辨证", level: 3, highFreqPoints: ["太阳病证", "阳明病证", "少阳病证", "太阴病证", "少阴病证", "厥阴病证", "六经传变"], easyMistakes: ["太阳经证与腑证的鉴别", "少阴寒化与热化的鉴别"] },
          { id: "tcm-diag/syndrome-diff/wei-qi", name: "卫气营血辨证", level: 3, highFreqPoints: ["卫分证", "气分证", "营分证", "血分证", "传变规律"], easyMistakes: ["卫气营血的传变顺序", "气分证的脏腑定位"] },
          { id: "tcm-diag/syndrome-diff/sanjiao", name: "三焦辨证", level: 3, highFreqPoints: ["上焦病证", "中焦病证", "下焦病证", "传变规律"], easyMistakes: ["三焦辨证与卫气营血辨证的关系"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 3. 中药学
  // ==========================================================
  {
    id: "herbs",
    name: "中药学",
    level: 1,
    children: [
      {
        id: "herbs/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "herbs/intro/properties", name: "中药的性能", level: 3, highFreqPoints: ["四气五味", "升降浮沉", "归经", "毒性"], easyMistakes: ["四气与五味的结合应用", "升降浮沉的影响因素"] },
          { id: "herbs/intro/compatibility", name: "中药的配伍与禁忌", level: 3, highFreqPoints: ["七情配伍", "配伍禁忌（十八反、十九畏）", "妊娠用药禁忌", "服药禁忌"], easyMistakes: ["十八反、十九畏的具体内容记忆", "相须与相使的区别"] },
          { id: "herbs/intro/dosage", name: "中药的剂量与用法", level: 3, highFreqPoints: ["特殊煎法（先煎、后下、包煎、另煎、烊化）", "服药时间与方法"], easyMistakes: ["特殊煎法适用药物的记忆"] },
        ],
      },
      {
        id: "herbs/specific",
        name: "各论",
        level: 2,
        children: [
          { id: "herbs/specific/jiebiao", name: "解表药", level: 3, highFreqPoints: ["麻黄、桂枝、紫苏、荆芥、防风、羌活、白芷", "薄荷、牛蒡子、桑叶、菊花、柴胡、葛根"], easyMistakes: ["麻黄与桂枝功效鉴别", "桑叶与菊花功效鉴别", "柴胡在不同方剂中的配伍意义"] },
          { id: "herbs/specific/qingre", name: "清热药", level: 3, highFreqPoints: ["石膏、知母、栀子、夏枯草", "黄芩、黄连、黄柏", "金银花、连翘、蒲公英、板蓝根", "生地黄、玄参、牡丹皮", "青蒿、地骨皮"], easyMistakes: ["三黄（芩连柏）的功效侧重", "生地与玄参的鉴别", "清热药各亚类的区分"] },
          { id: "herbs/specific/xiexia", name: "泻下药", level: 3, highFreqPoints: ["大黄、芒硝、番泻叶", "火麻仁、郁李仁", "甘遂、大戟、芫花"], easyMistakes: ["大黄的不同炮制与功效", "攻下、润下、峻下逐水药的分类"] },
          { id: "herbs/specific/zhushi", name: "祛风湿药", level: 3, highFreqPoints: ["独活、威灵仙、蕲蛇", "秦艽、防己", "桑寄生、五加皮"], easyMistakes: ["祛风湿散寒药与祛风湿清热药的区分"] },
          { id: "herbs/specific/huashi", name: "化湿药", level: 3, highFreqPoints: ["藿香、佩兰、苍术、厚朴、砂仁"], easyMistakes: ["厚朴与苍术的功效鉴别"] },
          { id: "herbs/specific/dampness", name: "利水渗湿药", level: 3, highFreqPoints: ["茯苓、薏苡仁、泽泻、猪苓", "车前子、滑石、金钱草、茵陈"], easyMistakes: ["茯苓与薏苡仁的鉴别", "茵陈与金钱草的功效侧重"] },
          { id: "herbs/specific/wenli", name: "温里药", level: 3, highFreqPoints: ["附子、干姜、肉桂、吴茱萸、细辛"], easyMistakes: ["附子先煎减毒", "肉桂与桂枝的来源与功效区别", "附子与干姜的配伍协同"] },
          { id: "herbs/specific/liqi", name: "理气药", level: 3, highFreqPoints: ["陈皮、枳实、木香、香附、川楝子、薤白"], easyMistakes: ["陈皮与青皮的功效区分", "香附\"气病之总司\"的理解"] },
          { id: "herbs/specific/xiaoshi", name: "消食药", level: 3, highFreqPoints: ["山楂、神曲、麦芽、莱菔子、鸡内金"], easyMistakes: ["不同消食药的适应症区别"] },
          { id: "herbs/specific/zhixue", name: "止血药", level: 3, highFreqPoints: ["大蓟、小蓟、地榆、槐花", "三七、茜草、蒲黄", "白及、仙鹤草", "艾叶、炮姜"], easyMistakes: ["止血药的分类（凉血止血、化瘀止血、收敛止血、温经止血）", "三七活血与止血的双向作用"] },
          { id: "herbs/specific/huoxue", name: "活血化瘀药", level: 3, highFreqPoints: ["川芎、延胡索、郁金、丹参", "红花、桃仁、益母草、牛膝", "三棱、莪术、水蛭"], easyMistakes: ["川芎\"血中之气药\"的理解", "丹参与川芎的功效侧重", "桃仁与红花的鉴别"] },
          { id: "herbs/specific/tan-kesou", name: "化痰止咳平喘药", level: 3, highFreqPoints: ["半夏、天南星、桔梗、川贝母、浙贝母", "苦杏仁、苏子、百部、桑白皮、葶苈子"], easyMistakes: ["川贝母与浙贝母的鉴别", "半夏与天南星的功效区别", "桑白皮与葶苈子的鉴别"] },
          { id: "herbs/specific/anshen", name: "安神药", level: 3, highFreqPoints: ["朱砂、磁石、龙骨、酸枣仁、远志"], easyMistakes: ["重镇安神与养心安神的分类"] },
          { id: "herbs/specific/pinggan", name: "平肝息风药", level: 3, highFreqPoints: ["石决明、牡蛎、代赭石", "羚羊角、牛黄、天麻、全蝎"], easyMistakes: ["平抑肝阳与息风止痉药的分类", "天麻与钩藤的鉴别"] },
          { id: "herbs/specific/kaigiao", name: "开窍药", level: 3, highFreqPoints: ["麝香、冰片、石菖蒲"], easyMistakes: ["麝香与冰片的用法区别", "开窍药的禁忌"] },
          { id: "herbs/specific/buxu", name: "补虚药", level: 3, highFreqPoints: ["人参、党参、黄芪、白术、甘草", "鹿茸、淫羊藿、杜仲、续断", "当归、熟地黄、白芍、阿胶", "沙参、麦冬、龟甲、鳖甲"], easyMistakes: ["人参与党参的鉴别", "黄芪与白术的功效侧重", "当归不同部位功效差异", "生地与熟地的区别"] },
          { id: "herbs/specific/shouse", name: "收涩药", level: 3, highFreqPoints: ["五味子、乌梅、诃子", "山茱萸、莲子、芡实"], easyMistakes: ["五味子补益与收涩的双重作用"] },
          { id: "herbs/specific/others", name: "涌吐药、攻毒杀虫药", level: 3, highFreqPoints: ["常山", "硫黄、雄黄、蛇床子"], easyMistakes: ["外用药的用法与禁忌"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 4. 方剂学
  // ==========================================================
  {
    id: "formulas",
    name: "方剂学",
    level: 1,
    children: [
      {
        id: "formulas/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "formulas/intro/concept", name: "方剂与治法", level: 3, highFreqPoints: ["方剂与治法的关系", "常用治法（八法）"], easyMistakes: ["汗吐下和温清补消八法的适用范围"] },
          { id: "formulas/intro/composition", name: "方剂的组成与变化", level: 3, highFreqPoints: ["君臣佐使的涵义", "方剂的变化形式"], easyMistakes: ["君药与臣药的区分", "药味加减与药量变化对功效的影响"] },
          { id: "formulas/intro/dosage-form", name: "剂型", level: 3, highFreqPoints: ["汤剂、散剂、丸剂、膏剂的特点"], easyMistakes: ["不同剂型的适用场景"] },
        ],
      },
      {
        id: "formulas/specific",
        name: "各论",
        level: 2,
        children: [
          { id: "formulas/specific/jiebiao", name: "解表剂", level: 3, highFreqPoints: ["麻黄汤、桂枝汤、小青龙汤", "银翘散、桑菊饮、麻杏甘石汤", "败毒散"], easyMistakes: ["桂枝汤的配伍意义（调和营卫）", "麻黄汤与桂枝汤的鉴别", "银翘散与桑菊饮的鉴别"] },
          { id: "formulas/specific/xiexia", name: "泻下剂", level: 3, highFreqPoints: ["大承气汤、大黄牡丹汤", "温脾汤", "麻子仁丸、济川煎"], easyMistakes: ["大承气汤的煎煮方法", "三承气汤的鉴别"] },
          { id: "formulas/specific/hejie", name: "和解剂", level: 3, highFreqPoints: ["小柴胡汤、蒿芩清胆汤", "四逆散、逍遥散", "半夏泻心汤"], easyMistakes: ["小柴胡汤的配伍特点", "逍遥散\"疏肝健脾养血\"三法并用的理解", "半夏泻心汤辛开苦降的配伍"] },
          { id: "formulas/specific/qingre", name: "清热剂", level: 3, highFreqPoints: ["白虎汤、竹叶石膏汤", "清营汤、犀角地黄汤", "黄连解毒汤、凉膈散", "导赤散、龙胆泻肝汤", "芍药汤、白头翁汤"], easyMistakes: ["清营汤\"透热转气\"的配伍", "龙胆泻肝汤的配伍意义", "芍药汤\"通因通用\"的运用"] },
          { id: "formulas/specific/wenli", name: "温里剂", level: 3, highFreqPoints: ["理中丸、小建中汤", "四逆汤、当归四逆汤", "阳和汤"], easyMistakes: ["四逆汤与当归四逆汤的鉴别", "阳和汤的配伍特点"] },
          { id: "formulas/specific/buyi", name: "补益剂", level: 3, highFreqPoints: ["四君子汤、参苓白术散、补中益气汤", "四物汤、归脾汤、八珍汤", "六味地黄丸、一贯煎、肾气丸"], easyMistakes: ["四君子汤与参苓白术散的鉴别", "补中益气汤\"升阳举陷\"的配伍", "六味地黄丸\"三补三泻\"的特点", "肾气丸\"少火生气\"的配伍"] },
          { id: "formulas/specific/guse", name: "固涩剂", level: 3, highFreqPoints: ["牡蛎散、玉屏风散", "四神丸"], easyMistakes: ["牡蛎散与玉屏风散的鉴别", "四神丸的配伍意义"] },
          { id: "formulas/specific/anshen", name: "安神剂", level: 3, highFreqPoints: ["朱砂安神丸、酸枣仁汤"], easyMistakes: ["朱砂安神丸与酸枣仁汤的鉴别"] },
          { id: "formulas/specific/liqi", name: "理气剂", level: 3, highFreqPoints: ["越鞠丸、半夏厚朴汤", "枳实薤白桂枝汤、苏子降气汤"], easyMistakes: ["越鞠丸\"五郁\"的配伍", "苏子降气汤\"上下同治\"的配伍"] },
          { id: "formulas/specific/lixue", name: "理血剂", level: 3, highFreqPoints: ["桃核承气汤、血府逐瘀汤、补阳还五汤", "小蓟饮子、黄土汤"], easyMistakes: ["血府逐瘀汤的配伍特点", "补阳还五汤\"补气活血\"的配伍", "黄土汤的配伍特点"] },
          { id: "formulas/specific/zhifeng", name: "治风剂", level: 3, highFreqPoints: ["川芎茶调散、羚角钩藤汤", "镇肝熄风汤、天麻钩藤饮"], easyMistakes: ["外风与内风的鉴别", "镇肝熄风汤的配伍意义"] },
          { id: "formulas/specific/zhizao", name: "治燥剂", level: 3, highFreqPoints: ["杏苏散、清燥救肺汤", "麦门冬汤、养阴清肺汤"], easyMistakes: ["杏苏散与清燥救肺汤的鉴别", "麦门冬汤\"培土生金\"的配伍"] },
          { id: "formulas/specific/qushi", name: "祛湿剂", level: 3, highFreqPoints: ["平胃散、藿香正气散", "八正散、茵陈蒿汤", "苓桂术甘汤、真武汤", "独活寄生汤"], easyMistakes: ["藿香正气散的临床应用", "茵陈蒿汤治疗湿热黄疸", "真武汤与苓桂术甘汤的鉴别", "独活寄生汤的配伍意义"] },
          { id: "formulas/specific/qutan", name: "祛痰剂", level: 3, highFreqPoints: ["二陈汤、温胆汤", "清气化痰丸、小陷胸汤", "半夏白术天麻汤"], easyMistakes: ["二陈汤的配伍意义", "半夏白术天麻汤治疗风痰眩晕"] },
          { id: "formulas/specific/xiaodao", name: "消导化积剂", level: 3, highFreqPoints: ["保和丸、枳实导滞丸"], easyMistakes: ["保和丸与枳实导滞丸的鉴别"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 5. 中医内科学
  // ==========================================================
  {
    id: "tcm-internal",
    name: "中医内科学",
    level: 1,
    children: [
      {
        id: "tcm-internal/lung",
        name: "肺系病证",
        level: 2,
        children: [
          { id: "tcm-internal/lung/common-cold", name: "感冒", level: 3, highFreqPoints: ["风寒束表证（荆防败毒散）", "风热犯表证（银翘散）", "暑湿伤表证（新加香薷饮）", "气虚感冒（参苏饮）", "阴虚感冒（加减葳蕤汤）"], easyMistakes: ["风寒与风热感冒的鉴别要点", "虚体感冒的辨证要点"] },
          { id: "tcm-internal/lung/cough", name: "咳嗽", level: 3, highFreqPoints: ["外感咳嗽（风寒袭肺、风热犯肺、风燥伤肺）", "内伤咳嗽（痰湿蕴肺、痰热郁肺、肝火犯肺、肺阴亏耗）"], easyMistakes: ["外感与内伤咳嗽的鉴别", "咳嗽各证型的主方记忆"] },
          { id: "tcm-internal/lung/asthma", name: "哮病", level: 3, highFreqPoints: ["发作期（冷哮、热哮、寒包热哮、风痰哮、虚哮）", "缓解期（肺脾气虚、肺肾两虚）"], easyMistakes: ["哮与喘的鉴别", "冷哮与热哮的鉴别要点"] },
          { id: "tcm-internal/lung/dyspnea", name: "喘证", level: 3, highFreqPoints: ["实喘（风寒壅肺、表寒肺热、痰热郁肺、痰浊阻肺）", "虚喘（肺气虚耗、肾虚不纳）"], easyMistakes: ["实喘与虚喘的鉴别", "喘证与哮病的鉴别"] },
          { id: "tcm-internal/lung/lung-abscess", name: "肺痈", level: 3, highFreqPoints: ["初期（银翘散）", "成痈期（千金苇茎汤）", "溃脓期（加味桔梗汤）", "恢复期（沙参清肺汤）"], easyMistakes: ["肺痈四期的辨证要点", "溃脓期的标志性症状"] },
          { id: "tcm-internal/lung/consumption", name: "肺痨", level: 3, highFreqPoints: ["肺阴亏损（月华丸）", "虚火灼肺（百合固金汤）", "气阴耗伤（保真汤）", "阴阳两虚（补天大造丸）"], easyMistakes: ["肺痨与虚劳的鉴别", "肺痨的四大主症"] },
        ],
      },
      {
        id: "tcm-internal/heart",
        name: "心系病证",
        level: 2,
        children: [
          { id: "tcm-internal/heart/palpitation", name: "心悸", level: 3, highFreqPoints: ["心虚胆怯（安神定志丸）", "心血不足（归脾汤）", "阴虚火旺（天王补心丹）", "心阳不振（桂枝甘草龙骨牡蛎汤）", "水饮凌心（苓桂术甘汤）", "瘀阻心脉（桃仁红花煎）"], easyMistakes: ["心悸各证型的主方鉴别", "惊悸与怔忡的区别"] },
          { id: "tcm-internal/heart/chest-pain", name: "胸痹", level: 3, highFreqPoints: ["心血瘀阻（血府逐瘀汤）", "气滞心胸（柴胡疏肝散）", "痰浊闭阻（瓜蒌薤白半夏汤）", "寒凝心脉（枳实薤白桂枝汤）", "气阴两虚（生脉散合人参养荣汤）", "心肾阴虚（天王补心丹）", "心肾阳虚（参附汤合右归饮）"], easyMistakes: ["胸痹\"阳微阴弦\"的病机认识", "胸痹各证型的鉴别要点", "真心痛的临床表现"] },
          { id: "tcm-internal/heart/insomnia", name: "不寐", level: 3, highFreqPoints: ["肝火扰心（龙胆泻肝汤）", "痰热扰心（黄连温胆汤）", "心脾两虚（归脾汤）", "心肾不交（六味地黄丸合交泰丸）", "心胆气虚（安神定志丸）"], easyMistakes: ["不寐各证型的鉴别要点", "心肾不交的治疗思路"] },
        ],
      },
      {
        id: "tcm-internal/spleen-stomach",
        name: "脾胃系病证",
        level: 2,
        children: [
          { id: "tcm-internal/spleen-stomach/stomachache", name: "胃痛", level: 3, highFreqPoints: ["寒邪客胃（良附丸）", "饮食伤胃（保和丸）", "肝气犯胃（柴胡疏肝散）", "肝胃郁热（化肝煎）", "湿热中阻（清中汤）", "胃阴亏耗（一贯煎合芍药甘草汤）", "脾胃虚寒（黄芪建中汤）"], easyMistakes: ["胃痛各证型的鉴别", "胃痛与心痛的鉴别诊断"] },
          { id: "tcm-internal/spleen-stomach/vomiting", name: "呕吐", level: 3, highFreqPoints: ["外邪犯胃（藿香正气散）", "食滞内停（保和丸）", "痰饮中阻（小半夏汤合苓桂术甘汤）", "肝气犯胃（四七汤）", "脾胃气虚（香砂六君子汤）", "胃阴不足（麦门冬汤）"], easyMistakes: ["呕吐各证型的鉴别要点"] },
          { id: "tcm-internal/spleen-stomach/abdominal-pain", name: "腹痛", level: 3, highFreqPoints: ["寒邪内阻（良附丸合正气天香散）", "湿热壅滞（大承气汤）", "饮食积滞（枳实导滞丸）", "气机郁滞（柴胡疏肝散）", "瘀血内停（少腹逐瘀汤）", "中虚脏寒（小建中汤）"], easyMistakes: ["腹痛的脏腑定位", "腹痛各证型的鉴别"] },
          { id: "tcm-internal/spleen-stomach/diarrhea", name: "泄泻", level: 3, highFreqPoints: ["寒湿内盛（藿香正气散）", "湿热伤中（葛根芩连汤）", "食滞肠胃（保和丸）", "肝气乘脾（痛泻要方）", "脾胃虚弱（参苓白术散）", "肾阳虚衰（四神丸）"], easyMistakes: ["泄泻与痢疾的鉴别", "泄泻各证型的主方"] },
          { id: "tcm-internal/spleen-stomach/constipation", name: "便秘", level: 3, highFreqPoints: ["热秘（麻子仁丸）", "气秘（六磨汤）", "冷秘（温脾汤）", "气虚秘（黄芪汤）", "血虚秘（润肠丸）", "阴虚秘（增液汤）", "阳虚秘（济川煎）"], easyMistakes: ["便秘各证型的鉴别与主方"] },
        ],
      },
      {
        id: "tcm-internal/liver-gall",
        name: "肝胆病证",
        level: 2,
        children: [
          { id: "tcm-internal/liver-gall/hypochondrium", name: "胁痛", level: 3, highFreqPoints: ["肝郁气滞（柴胡疏肝散）", "肝胆湿热（龙胆泻肝汤）", "瘀血阻络（血府逐瘀汤）", "肝络失养（一贯煎）"], easyMistakes: ["胁痛各证型的鉴别"] },
          { id: "tcm-internal/liver-gall/jaundice", name: "黄疸", level: 3, highFreqPoints: ["阳黄（热重于湿茵陈蒿汤、湿重于热茵陈五苓散）", "阴黄（茵陈术附汤）", "急黄（犀角散）", "黄疸消退后调治"], easyMistakes: ["阳黄与阴黄的鉴别要点", "急黄的特征与治疗"] },
          { id: "tcm-internal/liver-gall/headache", name: "头痛", level: 3, highFreqPoints: ["外感头痛（风寒川芎茶调散、风热芎芷石膏汤、风湿羌活胜湿汤）", "内伤头痛（肝阳天麻钩藤饮、血虚加味四物汤、痰浊半夏白术天麻汤、瘀血通窍活血汤、肾虚大补元煎）"], easyMistakes: ["头痛的引经药应用", "外感与内伤头痛的鉴别"] },
          { id: "tcm-internal/liver-gall/dizziness", name: "眩晕", level: 3, highFreqPoints: ["肝阳上亢（天麻钩藤饮）", "气血亏虚（归脾汤）", "肾精不足（左归丸）", "痰湿中阻（半夏白术天麻汤）", "瘀血阻窍（通窍活血汤）"], easyMistakes: ["眩晕各证型的鉴别要点", "眩晕与中风的鉴别"] },
        ],
      },
      {
        id: "tcm-internal/kidney",
        name: "肾系病证",
        level: 2,
        children: [
          { id: "tcm-internal/kidney/edema", name: "水肿", level: 3, highFreqPoints: ["阳水（风水相搏越婢加术汤、湿毒浸淫麻黄连翘赤小豆汤、水湿浸渍五皮饮）", "阴水（脾阳虚衰实脾饮、肾阳虚衰真武汤、瘀水互结桃红四物汤）"], easyMistakes: ["阳水与阴水的鉴别要点", "水肿的治法\"腰以上肿发汗、腰以下肿利小便\""] },
          { id: "tcm-internal/kidney/stranguria", name: "淋证", level: 3, highFreqPoints: ["热淋（八正散）", "石淋（石韦散）", "血淋（小蓟饮子）", "气淋（沉香散）", "膏淋（萆薢分清饮）", "劳淋（无比山药丸）"], easyMistakes: ["六淋的鉴别要点", "血淋与尿血的鉴别"] },
          { id: "tcm-internal/kidney/retention", name: "癃闭", level: 3, highFreqPoints: ["膀胱湿热（八正散）", "肺热壅盛（清肺饮）", "肝郁气滞（沉香散）", "浊瘀阻塞（代抵当丸）", "脾气不升（补中益气汤）", "肾阳衰惫（济生肾气丸）"], easyMistakes: ["癃闭与淋证的鉴别", "癃闭\"上窍开则下窍通\"的治疗思路"] },
        ],
      },
      {
        id: "tcm-internal/qi-blood",
        name: "气血津液病证",
        level: 2,
        children: [
          { id: "tcm-internal/qi-blood/depression", name: "郁证", level: 3, highFreqPoints: ["肝气郁结（柴胡疏肝散）", "气郁化火（丹栀逍遥散）", "痰气郁结（半夏厚朴汤）", "心神失养（甘麦大枣汤）", "心脾两虚（归脾汤）"], easyMistakes: ["郁证各证型的鉴别要点", "半夏厚朴汤治疗\"梅核气\""] },
          { id: "tcm-internal/qi-blood/blood-syndrome", name: "血证", level: 3, highFreqPoints: ["鼻衄、齿衄、咳血、吐血、便血、尿血、紫斑的辨证论治"], easyMistakes: ["各种血证的鉴别与主方", "治血三法：治火、治气、治血"] },
          { id: "tcm-internal/qi-blood/diabetes", name: "消渴", level: 3, highFreqPoints: ["上消（肺热津伤消渴方）", "中消（胃热炽盛玉女煎）", "下消（肾阴亏虚六味地黄丸、阴阳两虚金匮肾气丸）"], easyMistakes: ["三消的鉴别要点", "消渴的并发症"] },
        ],
      },
      {
        id: "tcm-internal/limb-meridian",
        name: "肢体经络病证",
        level: 2,
        children: [
          { id: "tcm-internal/limb-meridian/bi", name: "痹证", level: 3, highFreqPoints: ["行痹（防风汤）", "痛痹（乌头汤）", "着痹（薏苡仁汤）", "风湿热痹（白虎加桂枝汤）", "痰瘀痹阻（双合汤）", "肝肾亏虚（独活寄生汤）"], easyMistakes: ["行痹、痛痹、着痹的鉴别要点", "痹证与痿证的鉴别"] },
          { id: "tcm-internal/limb-meridian/wei", name: "痿证", level: 3, highFreqPoints: ["肺热津伤（清燥救肺汤）", "湿热浸淫（加味二妙散）", "脾胃虚弱（参苓白术散）", "肝肾亏损（虎潜丸）"], easyMistakes: ["痿证\"独取阳明\"的治疗原则", "痿证与痹证的鉴别要点"] },
          { id: "tcm-internal/limb-meridian/lumbago", name: "腰痛", level: 3, highFreqPoints: ["寒湿腰痛（甘姜苓术汤）", "湿热腰痛（四妙丸）", "瘀血腰痛（身痛逐瘀汤）", "肾虚腰痛（左归丸/右归丸）"], easyMistakes: ["腰痛各证型的鉴别要点"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 6. 针灸学
  // ==========================================================
  {
    id: "acupuncture",
    name: "针灸学",
    level: 1,
    children: [
      {
        id: "acupuncture/meridian-intro",
        name: "经络总论",
        level: 2,
        children: [
          { id: "acupuncture/meridian-intro/system", name: "经络系统的组成", level: 3, highFreqPoints: ["十二经脉", "奇经八脉", "十五络脉", "十二经别", "十二经筋", "十二皮部"], easyMistakes: ["经脉与络脉的数量区别"] },
          { id: "acupuncture/meridian-intro/rules", name: "十二经脉的循行规律", level: 3, highFreqPoints: ["走向与交接规律", "分布规律", "表里关系", "流注次序"], easyMistakes: ["手足三阴三阳的对应关系", "流注次序的循环记忆"] },
          { id: "acupuncture/meridian-intro/extra", name: "奇经八脉的功能", level: 3, highFreqPoints: ["督脉\"阳脉之海\"", "任脉\"阴脉之海\"", "冲脉\"十二经之海\"", "带脉约束纵行诸经"], easyMistakes: ["奇经八脉\"别道奇行\"的特点", "\"一源三歧\"的理解"] },
        ],
      },
      {
        id: "acupuncture/point-intro",
        name: "腧穴总论",
        level: 2,
        children: [
          { id: "acupuncture/point-intro/classification", name: "腧穴的分类与定位", level: 3, highFreqPoints: ["十四经穴、奇穴、阿是穴", "骨度分寸定位法", "体表标志定位法", "手指同身寸定位法"], easyMistakes: ["骨度分寸的数值记忆", "手指同身寸的适用部位"] },
          { id: "acupuncture/point-intro/specific", name: "特定穴", level: 3, highFreqPoints: ["五输穴", "原穴、络穴", "俞穴、募穴", "八会穴", "八脉交会穴", "郄穴、下合穴"], easyMistakes: ["五输穴的五行配属", "原穴与络穴的临床应用", "俞募配穴法", "八会穴的内容记忆"] },
        ],
      },
      {
        id: "acupuncture/meridian-points",
        name: "经络腧穴各论",
        level: 2,
        children: [
          { id: "acupuncture/meridian-points/lung", name: "手太阴肺经", level: 3, highFreqPoints: ["中府、云门、尺泽、孔最、列缺、太渊、鱼际、少商"], easyMistakes: ["肺经的循行路线", "尺泽与列缺的主治区别"] },
          { id: "acupuncture/meridian-points/large-intestine", name: "手阳明大肠经", level: 3, highFreqPoints: ["商阳、合谷、阳溪、手三里、曲池、肩髃、迎香"], easyMistakes: ["合谷穴的主治与针刺注意事项", "曲池与合谷的配对应用"] },
          { id: "acupuncture/meridian-points/stomach", name: "足阳明胃经", level: 3, highFreqPoints: ["四白、地仓、颊车、下关、天枢、足三里、上巨虚、丰隆"], easyMistakes: ["足三里\"保健要穴\"的理解", "天枢穴的定位与主治"] },
          { id: "acupuncture/meridian-points/spleen", name: "足太阴脾经", level: 3, highFreqPoints: ["隐白、太白、公孙、三阴交、地机、阴陵泉、血海"], easyMistakes: ["三阴交的定位与主治", "血海穴的定位"] },
          { id: "acupuncture/meridian-points/heart", name: "手少阴心经", level: 3, highFreqPoints: ["极泉、少海、通里、阴郄、神门、少冲"], easyMistakes: ["神门穴的主治", "心经的循行"] },
          { id: "acupuncture/meridian-points/small-intestine", name: "手太阳小肠经", level: 3, highFreqPoints: ["少泽、后溪、养老、支正、天宗、颧髎、听宫"], easyMistakes: ["后溪通督脉的临床应用"] },
          { id: "acupuncture/meridian-points/bladder", name: "足太阳膀胱经", level: 3, highFreqPoints: ["睛明、攒竹、天柱、背俞穴（肺俞至肾俞）、委中、承山、昆仑、申脉"], easyMistakes: ["背俞穴的定位与主治", "委中穴\"腰背委中求\"的理解"] },
          { id: "acupuncture/meridian-points/kidney", name: "足少阴肾经", level: 3, highFreqPoints: ["涌泉、太溪、照海、复溜"], easyMistakes: ["涌泉的定位与急救应用", "太溪与复溜的主治区别"] },
          { id: "acupuncture/meridian-points/pericardium", name: "手厥阴心包经", level: 3, highFreqPoints: ["曲泽、郄门、间使、内关、大陵、劳宫"], easyMistakes: ["内关穴的主治与配对应用"] },
          { id: "acupuncture/meridian-points/triple-burner", name: "手少阳三焦经", level: 3, highFreqPoints: ["中渚、阳池、外关、支沟、翳风、耳门"], easyMistakes: ["外关穴通阳维脉的临床应用"] },
          { id: "acupuncture/meridian-points/gallbladder", name: "足少阳胆经", level: 3, highFreqPoints: ["听会、阳白、风池、肩井、环跳、风市、阳陵泉、光明、悬钟"], easyMistakes: ["风池穴的定位与主治", "阳陵泉\"筋会\"的理解"] },
          { id: "acupuncture/meridian-points/liver", name: "足厥阴肝经", level: 3, highFreqPoints: ["行间、太冲、蠡沟、曲泉、章门、期门"], easyMistakes: ["太冲的临床应用", "期门穴的定位"] },
          { id: "acupuncture/meridian-points/ren-du", name: "任脉与督脉", level: 3, highFreqPoints: ["任脉：中极、关元、气海、神阙、中脘、膻中", "督脉：长强、腰阳关、命门、至阳、大椎、哑门、百会、水沟"], easyMistakes: ["关元与气海的主治区别", "百会穴的定位与主治", "大椎穴的主治"] },
          { id: "acupuncture/meridian-points/extra", name: "常用经外奇穴", level: 3, highFreqPoints: ["四神聪、印堂、太阳、夹脊、十宣"], easyMistakes: ["经外奇穴的定位与主治"] },
        ],
      },
      {
        id: "acupuncture/treatment",
        name: "针灸治疗",
        level: 2,
        children: [
          { id: "acupuncture/treatment/principles", name: "治疗原则与配穴", level: 3, highFreqPoints: ["针灸治疗原则", "选穴原则", "配穴方法", "特定穴的临床应用"], easyMistakes: ["远近配穴与前后配穴的应用", "原络配穴与俞募配穴的区别"] },
          { id: "acupuncture/treatment/diseases", name: "各科病证治疗", level: 3, highFreqPoints: ["内科病证（头痛、面瘫、中风、痹证、痿证、腰痛）", "妇儿科病证（痛经、月经不调、遗尿）", "皮外骨伤（扭伤、蛇串疮）", "五官科（耳鸣耳聋、牙痛）"], easyMistakes: ["面瘫的针灸治法", "中风中脏腑与中经络的治法差异", "痛经的辨证选穴"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 7. 中医外科学
  // ==========================================================
  {
    id: "tcm-surgery",
    name: "中医外科学",
    level: 1,
    children: [
      {
        id: "tcm-surgery/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "tcm-surgery/intro/etiology", name: "中医外科学基础", level: 3, highFreqPoints: ["发展概况", "病因病机（外感六淫、情志内伤、饮食不节）", "阴阳辨证", "治法总论（内治法、外治法）"], easyMistakes: ["外科疾病的阴阳辨证要点", "消托补三法的应用原则"] },
        ],
      },
      {
        id: "tcm-surgery/sores",
        name: "疮疡",
        level: 2,
        children: [
          { id: "tcm-surgery/sores/furuncle", name: "疖、痈、有头疽", level: 3, highFreqPoints: ["疖的辨证论治（仙方活命饮）", "痈的辨证论治", "有头疽的辨证论治"], easyMistakes: ["疖与痈的鉴别", "有头疽的虚实辨证"] },
          { id: "tcm-surgery/sores/erysipelas", name: "丹毒、流注等", level: 3, highFreqPoints: ["丹毒的辨证论治", "流注的辨证论治"], easyMistakes: ["丹毒与痈的鉴别"] },
        ],
      },
      {
        id: "tcm-surgery/breast",
        name: "乳房疾病",
        level: 2,
        children: [
          { id: "tcm-surgery/breast/mastitis", name: "乳痈", level: 3, highFreqPoints: ["乳痈的病因病机", "辨证论治（瓜蒌牛蒡汤）"], easyMistakes: ["乳痈不同分期的治法差异"] },
          { id: "tcm-surgery/breast/hyperplasia", name: "乳癖", level: 3, highFreqPoints: ["乳癖的辨证分型与治疗", "与乳岩的鉴别"], easyMistakes: ["乳癖与乳岩的鉴别要点"] },
        ],
      },
      {
        id: "tcm-surgery/skin",
        name: "皮肤疾病",
        level: 2,
        children: [
          { id: "tcm-surgery/skin/herpes", name: "蛇串疮、湿疮", level: 3, highFreqPoints: ["蛇串疮（带状疱疹）的辨证论治", "湿疮（湿疹）的辨证论治"], easyMistakes: ["蛇串疮肝经郁热与脾虚湿蕴的鉴别"] },
          { id: "tcm-surgery/skin/urticaria", name: "瘾疹、白疕", level: 3, highFreqPoints: ["瘾疹（荨麻疹）的辨证论治", "白疕（银屑病）的辨证论治"], easyMistakes: ["瘾疹各证型的鉴别要点"] },
        ],
      },
      {
        id: "tcm-surgery/rectal",
        name: "肛肠疾病",
        level: 2,
        children: [
          { id: "tcm-surgery/rectal/hemorrhoids", name: "痔", level: 3, highFreqPoints: ["内痔、外痔、混合痔的辨证论治", "痔的治法（内治、外治、手术）"], easyMistakes: ["内外痔的鉴别"] },
          { id: "tcm-surgery/rectal/abscess", name: "肛痈、肛裂", level: 3, highFreqPoints: ["肛痈的辨证论治", "肛裂的辨证论治"], easyMistakes: ["肛痈与肛瘘的关系"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 8. 中医妇科学
  // ==========================================================
  {
    id: "tcm-gynecology",
    name: "中医妇科学",
    level: 1,
    children: [
      {
        id: "tcm-gynecology/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "tcm-gynecology/intro/physiology", name: "女性生理特点", level: 3, highFreqPoints: ["月经的生理", "带下的生理", "妊娠与产育"], easyMistakes: ["天癸的生理作用", "冲任督带与月经的关系"] },
          { id: "tcm-gynecology/intro/pathogenesis", name: "病因病机与治法", level: 3, highFreqPoints: ["妇科疾病的病因病机", "治法概要（补肾、疏肝、健脾、调理气血）"], easyMistakes: ["妇科病机特点：气血失调、脏腑功能失常、冲任损伤"] },
        ],
      },
      {
        id: "tcm-gynecology/menstruation",
        name: "月经病",
        level: 2,
        children: [
          { id: "tcm-gynecology/menstruation/irregular", name: "月经先期/后期/先后无定期", level: 3, highFreqPoints: ["月经先期（气虚补中益气汤、血热清经散）", "月经后期（肾虚归肾丸、血虚大补元煎）", "先后无定期（肝郁逍遥散、肾虚固阴煎）"], easyMistakes: ["各证型主方的鉴别要点"] },
          { id: "tcm-gynecology/menstruation/dysmenorrhea", name: "痛经", level: 3, highFreqPoints: ["气滞血瘀（膈下逐瘀汤）", "寒凝血瘀（少腹逐瘀汤）", "湿热瘀阻（清热调血汤）", "气血虚弱（圣愈汤）", "肾气亏损（益肾调经汤）"], easyMistakes: ["实证与虚证痛经的鉴别要点", "经前痛与经后痛的辨证意义"] },
          { id: "tcm-gynecology/menstruation/amenorrhea", name: "闭经", level: 3, highFreqPoints: ["气血虚弱（人参养荣汤）", "肾气亏损（加减苁蓉菟丝子丸）", "阴虚血燥（加减一阴煎）", "气滞血瘀（血府逐瘀汤）", "痰湿阻滞（苍附导痰丸）"], easyMistakes: ["闭经与早孕的鉴别"] },
          { id: "tcm-gynecology/menstruation/metrorrhagia", name: "崩漏", level: 3, highFreqPoints: ["崩漏的治疗原则（塞流、澄源、复旧）", "脾虚（固本止崩汤）", "肾虚（左归丸/右归丸）", "血热（清热固经汤）", "血瘀（逐瘀止崩汤）"], easyMistakes: ["崩与漏的区别", "三法在临床中的灵活运用"] },
          { id: "tcm-gynecology/menstruation/menopause", name: "经断前后诸证", level: 3, highFreqPoints: ["肾阴虚（左归丸）", "肾阳虚（右归丸）", "肾阴阳俱虚（二仙汤）"], easyMistakes: ["绝经前后诸证的辨证要点"] },
        ],
      },
      {
        id: "tcm-gynecology/leukorrhea",
        name: "带下病",
        level: 2,
        children: [
          { id: "tcm-gynecology/leukorrhea/excess", name: "带下过多", level: 3, highFreqPoints: ["脾虚（完带汤）", "肾阳虚（内补丸）", "阴虚夹湿（知柏地黄丸）", "湿热下注（止带方）"], easyMistakes: ["带下过多的辨证要点", "白带与黄带的临床意义"] },
        ],
      },
      {
        id: "tcm-gynecology/pregnancy",
        name: "妊娠病",
        level: 2,
        children: [
          { id: "tcm-gynecology/pregnancy/morning-sickness", name: "恶阻", level: 3, highFreqPoints: ["脾胃虚弱（香砂六君子汤）", "肝胃不和（橘皮竹茹汤）"], easyMistakes: ["恶阻的调护要点"] },
          { id: "tcm-gynecology/pregnancy/threatened", name: "胎漏、胎动不安", level: 3, highFreqPoints: ["肾虚（寿胎丸）", "气血虚弱（胎元饮）", "血热（保阴煎）"], easyMistakes: ["胎漏与胎动不安的鉴别", "寿胎丸的药物组成"] },
        ],
      },
      {
        id: "tcm-gynecology/postpartum",
        name: "产后病",
        level: 2,
        children: [
          { id: "tcm-gynecology/postpartum/fever", name: "产后发热", level: 3, highFreqPoints: ["感染邪毒（五味消毒饮）", "外感（荆穗四物汤）", "血虚（补中益气汤）", "血瘀（生化汤）"], easyMistakes: ["产后发热各证型的鉴别要点"] },
          { id: "tcm-gynecology/postpartum/lochia", name: "恶露不绝", level: 3, highFreqPoints: ["气虚（补中益气汤）", "血热（保阴煎）", "血瘀（生化汤）"], easyMistakes: ["恶露不绝各证型的鉴别"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 9. 中医儿科学
  // ==========================================================
  {
    id: "tcm-pediatrics",
    name: "中医儿科学",
    level: 1,
    children: [
      {
        id: "tcm-pediatrics/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "tcm-pediatrics/intro/physiology", name: "小儿生理病理特点", level: 3, highFreqPoints: ["脏腑娇嫩、形气未充", "生机蓬勃、发育迅速", "发病容易、传变迅速", "脏气清灵、易趋康复"], easyMistakes: ["\"稚阴稚阳\"与\"纯阳\"学说的理解"] },
          { id: "tcm-pediatrics/intro/growth", name: "生长发育与喂养", level: 3, highFreqPoints: ["体格生长指标", "动作语言发育", "母乳喂养与人工喂养"], easyMistakes: ["生长发育的里程碑指标"] },
        ],
      },
      {
        id: "tcm-pediatrics/lung",
        name: "肺系病证",
        level: 2,
        children: [
          { id: "tcm-pediatrics/lung/cold", name: "感冒、咳嗽", level: 3, highFreqPoints: ["小儿感冒的特点（夹痰、夹滞、夹惊）", "小儿咳嗽的辨证论治"], easyMistakes: ["小儿感冒夹痰夹滞夹惊的治法差异"] },
          { id: "tcm-pediatrics/lung/pneumonia", name: "肺炎喘嗽", level: 3, highFreqPoints: ["风寒闭肺、风热闭肺、痰热闭肺", "毒热闭肺、阴虚肺热、肺脾气虚"], easyMistakes: ["肺炎喘嗽的辨证要点", "变证（心阳虚衰、邪陷厥阴）的处理"] },
          { id: "tcm-pediatrics/lung/asthma", name: "哮喘", level: 3, highFreqPoints: ["发作期（寒性热性）", "缓解期（肺脾气虚、脾肾阳虚、肺肾阴虚）"], easyMistakes: ["小儿哮喘的特点与成人区别"] },
        ],
      },
      {
        id: "tcm-pediatrics/spleen",
        name: "脾系病证",
        level: 2,
        children: [
          { id: "tcm-pediatrics/spleen/diarrhea", name: "泄泻", level: 3, highFreqPoints: ["湿热泻、风寒泻、伤食泻", "脾虚泻、脾肾阳虚泻"], easyMistakes: ["小儿泄泻的辨证要点", "泄泻的变证（气阴两伤、阴竭阳脱）"] },
          { id: "tcm-pediatrics/spleen/anorexia", name: "厌食、积滞、疳证", level: 3, highFreqPoints: ["厌食（脾失健运、脾胃气虚、脾胃阴虚）", "积滞（乳食内积、脾虚夹积）", "疳证（疳气、疳积、干疳）"], easyMistakes: ["厌食与积滞的鉴别", "疳证的辨证要点与主方"] },
        ],
      },
      {
        id: "tcm-pediatrics/kidney",
        name: "肾系病证",
        level: 2,
        children: [
          { id: "tcm-pediatrics/kidney/edema", name: "小儿水肿", level: 3, highFreqPoints: ["风水相搏（麻黄连翘赤小豆汤）", "湿热内侵（五味消毒饮）"], easyMistakes: ["急性肾炎与肾病综合征的鉴别"] },
          { id: "tcm-pediatrics/kidney/enuresis", name: "遗尿", level: 3, highFreqPoints: ["肺脾气虚（补中益气汤）", "肾气不足（菟丝子散）", "肝经湿热（龙胆泻肝汤）"], easyMistakes: ["遗尿各证型的鉴别要点"] },
        ],
      },
      {
        id: "tcm-pediatrics/infectious",
        name: "传染病",
        level: 2,
        children: [
          { id: "tcm-pediatrics/infectious/measles", name: "麻疹", level: 3, highFreqPoints: ["顺证与逆证的鉴别", "疹前期、出疹期、收没期的辨证"], easyMistakes: ["麻疹各期的特征及治疗要点"] },
          { id: "tcm-pediatrics/infectious/chickenpox", name: "水痘、痄腮", level: 3, highFreqPoints: ["水痘的辨证论治（银翘散）", "痄腮（流行性腮腺炎）的辨证论治"], easyMistakes: ["水痘与脓疱疮的鉴别"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 10. 中医骨伤科学
  // ==========================================================
  {
    id: "tcm-orthopedics",
    name: "中医骨伤科学",
    level: 1,
    children: [
      {
        id: "tcm-orthopedics/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "tcm-orthopedics/intro/diagnosis", name: "骨伤科基础", level: 3, highFreqPoints: ["病因病机", "诊断方法（望闻问切）", "治法（复位、固定、功能锻炼、内外用药）"], easyMistakes: ["骨伤科\"三期辨证\"的用药原则"] },
        ],
      },
      {
        id: "tcm-orthopedics/fracture",
        name: "骨折",
        level: 2,
        children: [
          { id: "tcm-orthopedics/fracture/upper", name: "上肢骨折", level: 3, highFreqPoints: ["锁骨骨折、肱骨外科颈骨折", "肱骨干骨折、肱骨髁上骨折", "前臂双骨折、桡骨远端骨折"], easyMistakes: ["肱骨髁上骨折的并发症（Volkmann缺血挛缩）", "桡骨远端骨折的Colles与Smith骨折鉴别"] },
          { id: "tcm-orthopedics/fracture/lower", name: "下肢骨折", level: 3, highFreqPoints: ["股骨颈骨折、股骨干骨折", "髌骨骨折、胫腓骨骨折", "踝部骨折"], easyMistakes: ["股骨颈骨折的血供特点与股骨头坏死风险"] },
          { id: "tcm-orthopedics/fracture/spine", name: "脊柱骨折", level: 3, highFreqPoints: ["脊柱骨折的分类", "脊髓损伤的早期处理"], easyMistakes: ["脊柱骨折搬运注意事项"] },
        ],
      },
      {
        id: "tcm-orthopedics/dislocation",
        name: "脱位",
        level: 2,
        children: [
          { id: "tcm-orthopedics/dislocation/joints", name: "关节脱位", level: 3, highFreqPoints: ["颞颌关节脱位", "肩关节脱位", "肘关节脱位", "小儿桡骨头半脱位"], easyMistakes: ["肩关节前脱位与后脱位的鉴别", "新鲜与陈旧性脱位的区分"] },
        ],
      },
      {
        id: "tcm-orthopedics/soft-tissue",
        name: "筋伤",
        level: 2,
        children: [
          { id: "tcm-orthopedics/soft-tissue/neck", name: "颈椎病", level: 3, highFreqPoints: ["颈型、神经根型、脊髓型", "椎动脉型、交感神经型"], easyMistakes: ["各型的临床表现与鉴别要点"] },
          { id: "tcm-orthopedics/soft-tissue/lumbar", name: "腰椎间盘突出症", level: 3, highFreqPoints: ["病因病机", "临床表现与诊断", "辨证论治"], easyMistakes: ["腰椎间盘突出与腰肌劳损的鉴别"] },
          { id: "tcm-orthopedics/soft-tissue/shoulder", name: "肩周炎", level: 3, highFreqPoints: ["临床表现", "分期与治疗"], easyMistakes: ["肩周炎的好发年龄与自愈倾向"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 11. 诊断学基础
  // ==========================================================
  {
    id: "diagnostics",
    name: "诊断学基础",
    level: 1,
    children: [
      {
        id: "diagnostics/symptoms",
        name: "常见症状",
        level: 2,
        children: [
          { id: "diagnostics/symptoms/fever", name: "发热", level: 3, highFreqPoints: ["发热的原因与分类", "热型（稽留热、弛张热、间歇热、回归热、波状热）"], easyMistakes: ["各种热型的鉴别及临床意义"] },
          { id: "diagnostics/symptoms/pain", name: "疼痛", level: 3, highFreqPoints: ["头痛（部位与临床意义）", "胸痛（心源性与非心源性）", "腹痛（急慢性、九分法）"], easyMistakes: ["不同部位腹痛对应的脏器", "急腹症的特点"] },
          { id: "diagnostics/symptoms/cough", name: "咳嗽与咯血", level: 3, highFreqPoints: ["咳嗽的性质与时间规律", "咯血与呕血的鉴别"], easyMistakes: ["咯血与呕血的鉴别要点"] },
          { id: "diagnostics/symptoms/edema", name: "水肿", level: 3, highFreqPoints: ["心源性、肾源性、肝源性水肿的鉴别"], easyMistakes: ["各型水肿的鉴别要点"] },
          { id: "diagnostics/symptoms/others", name: "其他常见症状", level: 3, highFreqPoints: ["呼吸困难、发绀、黄疸、昏迷"], easyMistakes: ["三种黄疸的鉴别"] },
        ],
      },
      {
        id: "diagnostics/physical-exam",
        name: "体格检查",
        level: 2,
        children: [
          { id: "diagnostics/physical-exam/head-neck", name: "一般检查与头颈部", level: 3, highFreqPoints: ["生命体征（体温、脉搏、呼吸、血压）", "皮肤黏膜检查", "淋巴结检查", "颈部血管与甲状腺"], easyMistakes: ["正常血压与高血压的分级标准"] },
          { id: "diagnostics/physical-exam/chest", name: "胸部检查", level: 3, highFreqPoints: ["肺部视触叩听（呼吸音、啰音、语音震颤）", "心脏视触叩听（心界、心音、杂音）"], easyMistakes: ["干啰音与湿啰音的鉴别", "心脏杂音的听诊要点（部位、时期、性质）", "第一心音与第二心音的鉴别"] },
          { id: "diagnostics/physical-exam/abdomen", name: "腹部检查", level: 3, highFreqPoints: ["腹部视诊（外形、蠕动波）", "腹部触诊（压痛、反跳痛、肝脾触诊）", "腹部叩诊（移动性浊音）", "腹部听诊（肠鸣音）"], easyMistakes: ["腹膜刺激征的组成", "移动性浊音的检查方法"] },
          { id: "diagnostics/physical-exam/nervous", name: "神经系统检查", level: 3, highFreqPoints: ["浅反射与深反射", "病理反射（Babinski征等）", "脑膜刺激征（颈强直、Kernig征、Brudzinski征）"], easyMistakes: ["病理反射与脑膜刺激征的临床意义"] },
        ],
      },
      {
        id: "diagnostics/lab",
        name: "实验室检查",
        level: 2,
        children: [
          { id: "diagnostics/lab/blood", name: "血液检查", level: 3, highFreqPoints: ["血常规（RBC、Hb、WBC、PLT）", "红细胞沉降率", "凝血功能检查"], easyMistakes: ["各类贫血的血象特点", "白细胞分类计数的临床意义"] },
          { id: "diagnostics/lab/liver-kidney", name: "肝肾功能检查", level: 3, highFreqPoints: ["肝功能（ALT、AST、胆红素、ALP、GGT、TP、ALB）", "肾功能（BUN、Cr、尿酸）"], easyMistakes: ["肝酶升高的临床意义分析"] },
          { id: "diagnostics/lab/blood-sugar", name: "血糖血脂与电解质", level: 3, highFreqPoints: ["血糖（空腹血糖、OGTT）", "血脂四项", "血清电解质（K、Na、Cl、Ca）"], easyMistakes: ["糖尿病的诊断标准"] },
          { id: "diagnostics/lab/urine-stool", name: "尿液与粪便检查", level: 3, highFreqPoints: ["尿常规（尿糖、尿蛋白、尿沉渣）", "粪便常规与隐血试验"], easyMistakes: ["尿蛋白的临床意义"] },
        ],
      },
      {
        id: "diagnostics/imaging",
        name: "影像学检查",
        level: 2,
        children: [
          { id: "diagnostics/imaging/xray", name: "X线与CT", level: 3, highFreqPoints: ["胸部X线（正常与常见病变）", "骨关节X线", "CT的临床应用"], easyMistakes: ["肺炎的X线表现鉴别", "不同影像学方法的适应证选择"] },
          { id: "diagnostics/imaging/ultrasound", name: "超声与MRI", level: 3, highFreqPoints: ["超声在腹部、心脏的应用", "MRI的临床应用"], easyMistakes: ["超声与MRI的适应证对比"] },
        ],
      },
      {
        id: "diagnostics/ecg",
        name: "心电图",
        level: 2,
        children: [
          { id: "diagnostics/ecg/normal", name: "正常心电图与基本测量", level: 3, highFreqPoints: ["心电图各波段的正常值", "心率与心电轴的计算"], easyMistakes: ["P-QRS-T波的意义与正常值"] },
          { id: "diagnostics/ecg/abnormal", name: "常见异常心电图", level: 3, highFreqPoints: ["心房肥大与心室肥厚", "心肌缺血与心肌梗死", "心律失常（早搏、房颤、室上速、传导阻滞）"], easyMistakes: ["心肌梗死的定位诊断与分期", "房颤的心电图特征", "室早与房早的鉴别"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 12. 内科学
  // ==========================================================
  {
    id: "internal-med",
    name: "内科学",
    level: 1,
    children: [
      {
        id: "internal-med/respiratory",
        name: "呼吸系统疾病",
        level: 2,
        children: [
          { id: "internal-med/respiratory/copd", name: "COPD", level: 3, highFreqPoints: ["病因与发病机制", "临床表现与分级", "诊断与治疗"], easyMistakes: ["COPD与支气管哮喘的鉴别", "慢性支气管炎的诊断标准"] },
          { id: "internal-med/respiratory/pneumonia", name: "肺炎", level: 3, highFreqPoints: ["肺炎链球菌肺炎", "肺炎支原体肺炎", "诊疗要点"], easyMistakes: ["典型肺炎与非典型肺炎的鉴别", "抗生素的合理选用"] },
          { id: "internal-med/respiratory/asthma", name: "支气管哮喘", level: 3, highFreqPoints: ["发病机制", "临床表现与分期", "治疗（控制药物与缓解药物）"], easyMistakes: ["哮喘的分级治疗", "β2受体激动剂与糖皮质激素的用法"] },
          { id: "internal-med/respiratory/tb", name: "肺结核", level: 3, highFreqPoints: ["分型与临床表现", "诊断（PPD、T-SPOT、痰检）", "化疗原则（早期、联合、适量、规律、全程）"], easyMistakes: ["初治与复治方案的差异", "结核药物的主要副作用"] },
        ],
      },
      {
        id: "internal-med/circulatory",
        name: "循环系统疾病",
        level: 2,
        children: [
          { id: "internal-med/circulatory/heart-failure", name: "心力衰竭", level: 3, highFreqPoints: ["左心衰与右心衰的临床表现", "心功能分级（NYHA）", "药物治疗"], easyMistakes: ["左心衰与右心衰的鉴别要点", "ACEI/ARB、β受体阻滞剂的应用原则"] },
          { id: "internal-med/circulatory/hypertension", name: "高血压", level: 3, highFreqPoints: ["血压分级标准", "危险分层", "药物治疗（五大类）"], easyMistakes: ["各类降压药的适应证与禁忌证", "高血压急症的处理"] },
          { id: "internal-med/circulatory/cad", name: "冠心病", level: 3, highFreqPoints: ["心绞痛的临床表现与分型", "急性心肌梗死的诊断（症状、心电图、心肌酶）", "治疗（药物、介入、搭桥）"], easyMistakes: ["稳定型与不稳定型心绞痛的鉴别", "AMI的心电图定位诊断"] },
          { id: "internal-med/circulatory/arrhythmia", name: "心律失常", level: 3, highFreqPoints: ["常见心律失常的心电图特征", "治疗原则"], easyMistakes: ["房颤的抗凝治疗指征", "室速与室上速的鉴别"] },
        ],
      },
      {
        id: "internal-med/digestive",
        name: "消化系统疾病",
        level: 2,
        children: [
          { id: "internal-med/digestive/ulcer", name: "消化性溃疡", level: 3, highFreqPoints: ["病因（HP感染、NSAIDs）", "临床表现与并发症", "诊断与治疗"], easyMistakes: ["胃溃疡与十二指肠溃疡的鉴别", "HP根除治疗方案"] },
          { id: "internal-med/digestive/cirrhosis", name: "肝硬化", level: 3, highFreqPoints: ["病因", "临床表现（肝功能减退、门脉高压）", "并发症（上消化道出血、肝性脑病、腹水）"], easyMistakes: ["肝硬化各并发症的处理要点"] },
          { id: "internal-med/digestive/pancreatitis", name: "胰腺炎", level: 3, highFreqPoints: ["急性胰腺炎的病因", "临床表现与诊断", "治疗"], easyMistakes: ["轻症与重症胰腺炎的鉴别"] },
        ],
      },
      {
        id: "internal-med/urinary",
        name: "泌尿系统疾病",
        level: 2,
        children: [
          { id: "internal-med/urinary/gn", name: "肾小球肾炎", level: 3, highFreqPoints: ["急性肾炎与慢性肾炎的鉴别", "肾病综合征的诊断标准"], easyMistakes: ["肾炎与肾病综合征的鉴别要点"] },
          { id: "internal-med/urinary/uti", name: "尿路感染", level: 3, highFreqPoints: ["上尿路感染与下尿路感染的鉴别", "诊断与治疗"], easyMistakes: ["急性肾盂肾炎与膀胱炎的鉴别"] },
          { id: "internal-med/urinary/ckd", name: "慢性肾衰竭", level: 3, highFreqPoints: ["分期标准", "临床表现（各系统表现）", "治疗"], easyMistakes: ["慢性肾衰竭的分期依据（eGFR）"] },
        ],
      },
      {
        id: "internal-med/endocrine",
        name: "内分泌与代谢疾病",
        level: 2,
        children: [
          { id: "internal-med/endocrine/dm", name: "糖尿病", level: 3, highFreqPoints: ["分型（1型与2型）", "诊断标准", "并发症（急性与慢性）", "治疗（五驾马车）"], easyMistakes: ["1型与2型糖尿病的鉴别", "DKA与HHS的鉴别", "口服降糖药的分类与适应证"] },
          { id: "internal-med/endocrine/thyroid", name: "甲状腺功能亢进症", level: 3, highFreqPoints: ["临床表现", "诊断（甲功、甲状腺彩超）", "治疗（药物、碘131、手术）"], easyMistakes: ["甲亢与单纯性甲状腺肿的鉴别", "抗甲状腺药物的副作用"] },
          { id: "internal-med/endocrine/gout", name: "痛风", level: 3, highFreqPoints: ["临床表现（急性关节炎期、间歇期、慢性期）", "诊断与治疗"], easyMistakes: ["急性期与缓解期用药的区别"] },
        ],
      },
      {
        id: "internal-med/rheumatic",
        name: "风湿免疫疾病",
        level: 2,
        children: [
          { id: "internal-med/rheumatic/ra", name: "类风湿关节炎", level: 3, highFreqPoints: ["临床表现（关节与关节外表现）", "诊断标准", "治疗"], easyMistakes: ["RA与骨关节炎、痛风的鉴别", "DMARDs的选用时机"] },
          { id: "internal-med/rheumatic/sle", name: "系统性红斑狼疮", level: 3, highFreqPoints: ["临床表现（多系统受累）", "诊断标准", "治疗"], easyMistakes: ["SLE的诊断标准记忆", "糖皮质激素的用量原则"] },
        ],
      },
      {
        id: "internal-med/neurology",
        name: "神经系统疾病",
        level: 2,
        children: [
          { id: "internal-med/neurology/stroke", name: "脑卒中", level: 3, highFreqPoints: ["缺血性与出血性卒中的鉴别", "诊断与影像学检查", "急性期治疗"], easyMistakes: ["脑梗死与脑出血的CT鉴别", "溶栓治疗的时间窗"] },
          { id: "internal-med/neurology/parkinson", name: "帕金森病", level: 3, highFreqPoints: ["临床表现（静止性震颤、肌强直、运动迟缓）", "诊断与药物治疗"], easyMistakes: ["帕金森病与帕金森综合征的鉴别"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 13. 传染病学
  // ==========================================================
  {
    id: "infectious-disease",
    name: "传染病学",
    level: 1,
    children: [
      {
        id: "infectious-disease/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "infectious-disease/intro/basics", name: "传染病学基础", level: 3, highFreqPoints: ["感染与免疫", "传染病的流行过程（传染源、传播途径、易感人群）", "传染病的特征与分期", "预防与控制"], easyMistakes: ["传染病潜伏期、前驱期、发病期的区分", "法定传染病的分类与报告制度"] },
        ],
      },
      {
        id: "infectious-disease/viral",
        name: "病毒性传染病",
        level: 2,
        children: [
          { id: "infectious-disease/viral/hepatitis", name: "病毒性肝炎", level: 3, highFreqPoints: ["各型肝炎病毒的传播途径", "临床表现", "诊断（血清学标志物）", "治疗与预防"], easyMistakes: ["甲、乙、丙、丁、戊型肝炎的传播途径区分", "乙肝两对半的临床意义", "抗病毒治疗指征"] },
          { id: "infectious-disease/viral/influenza", name: "流行性感冒", level: 3, highFreqPoints: ["病原学", "临床表现", "诊断与治疗"], easyMistakes: ["流感与普通感冒的鉴别"] },
          { id: "infectious-disease/viral/aids", name: "艾滋病", level: 3, highFreqPoints: ["病原学（HIV）", "传播途径", "临床表现（分期）", "诊断与治疗（抗病毒治疗）"], easyMistakes: ["HIV感染的窗口期", "艾滋病机会性感染的预防"] },
          { id: "infectious-disease/viral/rabies", name: "狂犬病", level: 3, highFreqPoints: ["病原学", "临床表现", "暴露后预防处置"], easyMistakes: ["狂犬病潜伏期与发病后的死亡率", "暴露后规范处置流程"] },
        ],
      },
      {
        id: "infectious-disease/bacterial",
        name: "细菌性传染病",
        level: 2,
        children: [
          { id: "infectious-disease/bacterial/typhoid", name: "伤寒", level: 3, highFreqPoints: ["病原学", "临床表现（极期特征）", "并发症", "诊断（肥达反应）"], easyMistakes: ["伤寒的玫瑰疹与相对缓脉", "肠出血与肠穿孔的预防"] },
          { id: "infectious-disease/bacterial/dysentery", name: "细菌性痢疾", level: 3, highFreqPoints: ["病原学", "临床表现", "诊断与鉴别", "治疗"], easyMistakes: ["急性菌痢与慢性菌痢的区分", "中毒性菌痢的临床表现"] },
          { id: "infectious-disease/bacterial/cholera", name: "霍乱", level: 3, highFreqPoints: ["病原学", "临床表现（脱水程度）", "诊断与治疗（补液为主）"], easyMistakes: ["霍乱的补液原则", "霍乱的隔离措施"] },
        ],
      },
      {
        id: "infectious-disease/others",
        name: "其他传染病",
        level: 2,
        children: [
          { id: "infectious-disease/others/malaria", name: "疟疾", level: 3, highFreqPoints: ["病原学与传播媒介", "临床表现（周期性寒战高热）", "诊断与抗疟治疗"], easyMistakes: ["间日疟与三日疟的周期区分"] },
          { id: "infectious-disease/others/schisto", name: "血吸虫病", level: 3, highFreqPoints: ["病原学与传播途径", "临床表现（急性、慢性、晚期）", "诊断与治疗"], easyMistakes: ["血吸虫病的疫水接触史"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 14. 医学伦理学
  // ==========================================================
  {
    id: "ethics",
    name: "医学伦理学",
    level: 1,
    children: [
      {
        id: "ethics/intro",
        name: "总论",
        level: 2,
        children: [
          { id: "ethics/intro/concept", name: "医学伦理学概述", level: 3, highFreqPoints: ["医学伦理学的概念", "医学模式转变", "生命伦理学的兴起"], easyMistakes: ["伦理学的基本理论（功利论、义务论、德性论）"] },
          { id: "ethics/intro/principles", name: "医学伦理学的基本原则", level: 3, highFreqPoints: ["尊重原则", "不伤害原则", "有利原则", "公正原则"], easyMistakes: ["四个基本原则的临床应用与权衡"] },
        ],
      },
      {
        id: "ethics/norms",
        name: "医德规范",
        level: 2,
        children: [
          { id: "ethics/norms/doctor", name: "医德规范体系", level: 3, highFreqPoints: ["医德规范的内容", "医德基本范畴（权利、义务、良心、荣誉、审慎、保密）"], easyMistakes: ["医德规范与法律规范的区别"] },
        ],
      },
      {
        id: "ethics/relationship",
        name: "医患关系",
        level: 2,
        children: [
          { id: "ethics/relationship/nature", name: "医患关系的性质与模式", level: 3, highFreqPoints: ["医患关系的性质", "医患关系模式（主动-被动、指导-合作、共同参与）"], easyMistakes: ["三种医患关系模式的适用场景"] },
          { id: "ethics/relationship/rights", name: "医患双方的权利与义务", level: 3, highFreqPoints: ["患者的权利（知情同意、隐私保护、医疗权）", "医务人员的权利与义务"], easyMistakes: ["知情同意的伦理要求", "特殊情况下知情同意的行使"] },
        ],
      },
      {
        id: "ethics/clinical",
        name: "临床诊疗伦理",
        level: 2,
        children: [
          { id: "ethics/clinical/diagnosis", name: "诊断与治疗伦理", level: 3, highFreqPoints: ["问诊、体检、辅助检查的伦理要求", "药物治疗、手术治疗的伦理要求", "急诊伦理"], easyMistakes: ["过度医疗与医疗必需的界限"] },
          { id: "ethics/clinical/end-of-life", name: "临终关怀与死亡伦理", level: 3, highFreqPoints: ["临终关怀的伦理意义", "安乐死的伦理争议", "脑死亡标准的伦理意义"], easyMistakes: ["安宁疗护与安乐死的区别"] },
        ],
      },
      {
        id: "ethics/research",
        name: "医学科研伦理",
        level: 2,
        children: [
          { id: "ethics/research/standards", name: "科研伦理规范", level: 3, highFreqPoints: ["涉及人的生物医学研究伦理原则", "赫尔辛基宣言", "知情同意与伦理审查"], easyMistakes: ["伦理委员会（IRB）的职责与组成"] },
        ],
      },
    ],
  },

  // ==========================================================
  // 15. 卫生法规
  // ==========================================================
  {
    id: "health-law",
    name: "卫生法规",
    level: 1,
    children: [
      {
        id: "health-law/doctor-law",
        name: "执业医师法",
        level: 2,
        children: [
          { id: "health-law/doctor-law/license", name: "医师执业管理制度", level: 3, highFreqPoints: ["医师资格考试制度", "医师执业注册", "医师的权利与义务", "执业规则与法律责任"], easyMistakes: ["不予注册、注销注册的情形区分", "医师定期考核制度"] },
        ],
      },
      {
        id: "health-law/drug-law",
        name: "药品管理法",
        level: 2,
        children: [
          { id: "health-law/drug-law/rules", name: "药品管理相关法规", level: 3, highFreqPoints: ["药品分类管理（处方药与非处方药）", "特殊药品管理（麻醉、精神、毒性、放射性药品）", "假药与劣药的界定"], easyMistakes: ["假药与劣药的界定标准", "处方药与非处方药的管理区别"] },
        ],
      },
      {
        id: "health-law/infectious-law",
        name: "传染病防治法",
        level: 2,
        children: [
          { id: "health-law/infectious-law/classification", name: "传染病分类与防控", level: 3, highFreqPoints: ["法定传染病分类（甲、乙、丙类）", "疫情报告制度", "控制措施与医疗救治"], easyMistakes: ["甲乙丙类传染病的具体名单", "传染病报告时限"] },
        ],
      },
      {
        id: "health-law/emergency",
        name: "突发公共卫生事件应急条例",
        level: 2,
        children: [
          { id: "health-law/emergency/rules", name: "应急管理规定", level: 3, highFreqPoints: ["突发公共卫生事件的定义与分级", "应急报告制度", "法律责任"], easyMistakes: ["突发公共卫生事件的分级标准"] },
        ],
      },
      {
        id: "health-law/malpractice",
        name: "医疗事故处理条例",
        level: 2,
        children: [
          { id: "health-law/malpractice/definition", name: "医疗事故的认定与处理", level: 3, highFreqPoints: ["医疗事故的定义与分级", "医疗事故的技术鉴定", "医疗事故的赔偿"], easyMistakes: ["医疗事故与医疗意外的区分", "医疗事故的分级标准"] },
        ],
      },
      {
        id: "health-law/tcm-law",
        name: "中医药条例",
        level: 2,
        children: [
          { id: "health-law/tcm-law/content", name: "中医药相关法规", level: 3, highFreqPoints: ["中医药服务、中药保护与发展", "中医药人才培养与科研"], easyMistakes: ["中医药条例对中医医疗机构的规定"] },
        ],
      },
      {
        id: "health-law/medical-institution",
        name: "医疗机构管理条例",
        level: 2,
        children: [
          { id: "health-law/medical-institution/content", name: "医疗机构管理", level: 3, highFreqPoints: ["医疗机构的设置审批", "执业登记与校验", "执业规则"], easyMistakes: ["医疗机构执业许可证的有效期与校验"] },
        ],
      },
    ],
  },
]

export default knowledgeSystem

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardText,
  Clock,
  Database,
  FileText,
  Gear,
  ListChecks,
  Plus,
  SealCheck,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

const steps = [
  ["定义问题", "明确研究范围与证伪条件"],
  ["收集证据", "公司披露、产业数据与宏观线索"],
  ["分析验证", "交叉核对趋势与口径"],
  ["形成结论", "区分事实、推断与不确定性"],
  ["研究复核", "检查反证、风险与来源"],
];

const evidence = [
  { id: 1, title: "全球半导体销售与库存追踪", source: "WSTS 产业月报", time: "2026-09-20 08:03", kind: "事实", fresh: "新鲜", excerpt: "主要细分领域的库存天数连续四个季度下降；存储与逻辑环节的降幅较为明显。", note: "统计口径：覆盖 17 家全球主要半导体公司；库存天数为期末库存除以近三个月日均销售额。" },
  { id: 2, title: "Q2 业绩电话会：库存与出货", source: "台积电、三星电子公开材料", time: "2026-09-19 18:41", kind: "事实", fresh: "新鲜", excerpt: "部分公司披露渠道库存去化、订单能见度改善；不同产品线恢复节奏并不一致。", note: "原始披露文档已归档；提取字段包括库存、出货、资本开支及管理层展望。" },
  { id: 3, title: "下游补库出现早期信号", source: "渠道与终端需求交叉验证", time: "2026-09-20 09:12", kind: "推断", fresh: "新鲜", excerpt: "渠道回补与订单改善共同出现，支持库存接近阶段性底部的推断，但尚未构成完整验证。", note: "该条为推断，依据两份公开披露与一项产业统计；不等同于对价格或收益的预测。" },
  { id: 4, title: "终端需求的持续性仍待确认", source: "PC、手机与工业需求跟踪", time: "2026-09-18 16:20", kind: "不确定", fresh: "较早", excerpt: "消费电子终端仍分化，若需求未持续回升，库存改善可能仅是短期补库。", note: "存在来源时效差异；该风险项将在下一检查点重新验证。" },
];

const agentRuns = [
  ["09:12", "研究目标已创建", "planner"],
  ["09:16", "已生成 5 步研究计划", "planner"],
  ["09:24", "完成主数据源采集 · 6 条证据", "tool"],
  ["09:38", "OTIX 渠道接口超时，切换备用源", "warning"],
  ["09:46", "完成口径交叉验证", "tool"],
  ["10:02", "等待用户审批下一阶段", "approval"],
];

function TrendCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#e8e6e1";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = 16 + i * ((height - 38) / 3);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    const values = [31, 36, 43, 49, 57, 53, 45, 40, 34, 30, 28, 29, 27, 28];
    const max = 60; const min = 20;
    ctx.strokeStyle = "#1f5b9a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = 12 + (1 - (value - min) / (max - min)) * (height - 36);
      index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = 12 + (1 - (value - min) / (max - min)) * (height - 36);
      ctx.fillStyle = index === values.length - 1 ? "#bb4e2e" : "#1f5b9a";
      ctx.beginPath(); ctx.arc(x, y, index === values.length - 1 ? 4 : 2.6, 0, Math.PI * 2); ctx.fill();
    });
  }, []);
  return <canvas className="trend-canvas" ref={ref} aria-label="半导体库存指数趋势图" />;
}

function Badge({ children, type }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function App() {
  const [selectedEvidence, setSelectedEvidence] = useState(evidence[0]);
  const [showRuns, setShowRuns] = useState(false);
  const [showNewResearch, setShowNewResearch] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [mission, setMission] = useState("验证半导体库存周期是否触底");
  const [approved, setApproved] = useState(false);
  const [toast, setToast] = useState("");
  const [goalDraft, setGoalDraft] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const createResearch = (event) => {
    event.preventDefault();
    if (!goalDraft.trim()) return;
    setMission(goalDraft.trim());
    setShowNewResearch(false);
    setGoalDraft("");
    setApproved(false);
    notify("研究任务已创建，Agent 已保存第一处检查点。");
  };

  const approve = () => {
    setShowApproval(false);
    setApproved(true);
    notify("已批准：Agent 正在基于已核验来源生成研究备忘录。");
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">X</span><span>XBuddy</span></div>
        <p className="brand-subtitle">研究清晰，判断有据</p>
        <button className="new-research" onClick={() => setShowNewResearch(true)}><Plus size={17} weight="bold" />新建研究</button>

        <div className="side-heading">研究进程</div>
        <nav className="stage-nav" aria-label="研究阶段">
          {steps.map(([title, sub], index) => (
            <button className={`stage ${index === 2 && !approved ? "active" : ""} ${index < 2 || approved ? "done" : ""}`} key={title} onClick={() => notify(`${title}：${sub}`)}>
              <span className="stage-dot">{index < 2 || approved ? <CheckCircle size={16} weight="fill" /> : index + 1}</span>
              <span><strong>{title}</strong><small>{sub}</small></span>
            </button>
          ))}
        </nav>

        <div className="side-divider" />
        <div className="side-heading">长期记忆</div>
        <button className="memory-row" onClick={() => notify("已打开：半导体研究方法论")}> <BookOpen size={17} />半导体研究方法论</button>
        <button className="memory-row" onClick={() => notify("已打开：已保存的来源偏好")}> <SealCheck size={17} />可信来源偏好</button>
        <button className="memory-row" onClick={() => notify("已打开：待验证的历史假设")}> <Clock size={17} />待验证假设</button>
        <div className="side-bottom"><button onClick={() => notify("设置面板将在完整版本中提供")}> <Gear size={18} />设置</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="crumb"><span className="live-dot" />研究任务 · 自动保存于 2026-09-20 10:02</div>
          <div className="top-actions"><button aria-label="通知" onClick={() => notify("没有新的研究提醒")}><Bell size={19} /></button><span className="avatar">林</span><span className="user-name">林研究员</span></div>
        </header>

        <div className="content-grid">
          <section className="main-column">
            <div className="eyebrow">RESEARCH MISSION</div>
            <h1>{mission}</h1>
            <p className="mission-copy">基于公司披露、产业数据与需求信号，验证库存是否已出现阶段性拐点；本研究仅提供信息与分析，不构成投资建议。</p>
            <div className="tags"><span>半导体</span><span>库存周期</span><span>供需验证</span><span>公开来源</span></div>

            <section className="finding-panel">
              <div className="section-kicker">当前研究发现 <span>更新于 10:02</span></div>
              <div className="finding-quote">
                <span className="quote-bar" />
                <div><h2>{approved ? "已形成初步研究备忘录，仍需持续验证。" : "库存拐点出现早期信号，但确认条件尚不充分。"}</h2><p>库存去化与局部补库同时出现，支持“接近阶段性底部”的研究推断；但终端需求分化，尚不足以确认持续复苏。</p></div>
              </div>
              <div className="fact-grid">
                <div><Badge type="fact">已验证事实</Badge><p>主要公司库存天数连续下降，多个来源的方向一致。</p></div>
                <div><Badge type="inference">研究推断</Badge><p>库存可能接近阶段性底部，尚需需求端继续印证。</p></div>
                <div><Badge type="uncertain">尚不确定</Badge><p>消费电子需求的可持续性与库存改善节奏。</p></div>
              </div>
            </section>

            <section className="trend-section">
              <div className="section-heading"><div><h2>全球半导体库存指数</h2><p>指数化展示（2023 Q1 = 100），用于趋势观察，不代表价格预测</p></div><Badge type="source">4 个来源已交叉核验</Badge></div>
              <TrendCanvas />
              <div className="chart-footer"><span>2023 Q1</span><span>2024 Q1</span><span>2025 Q1</span><span>2026 Q3</span></div>
              <div className="chart-source">来源：公司公开披露、WSTS 产业数据；更新于 2026-09-20 09:46 · 口径说明见各证据卡。</div>
            </section>

            <section className="trail-section">
              <div className="section-heading"><div><h2>证据链</h2><p>每一项结论均可返回原始字段或原文。</p></div><button className="text-button" onClick={() => setShowRuns(true)}><ListChecks size={17} />查看 Agent 运行记录</button></div>
              <div className="trail">
                {evidence.slice(0, 3).map((item, index) => <button key={item.id} className={`trail-card ${selectedEvidence.id === item.id ? "selected" : ""}`} onClick={() => setSelectedEvidence(item)}><Badge type={item.kind === "事实" ? "fact" : "inference"}>{item.kind}</Badge><strong>{item.title}</strong><p>{item.excerpt}</p><small><FileText size={14} />{item.source} · {item.time}</small>{index < 2 && <span className="trail-arrow"><ArrowRight size={17} /></span>}</button>)}
              </div>
            </section>
          </section>

          <aside className="inspector">
            <div className="inspector-head"><div><span className="eyebrow">EVIDENCE INSPECTOR</span><h2>证据详情</h2></div><button aria-label="查看运行记录" onClick={() => setShowRuns(true)}><ListChecks size={20} /></button></div>
            <div className="source-card">
              <div className="source-icon"><FileText size={24} weight="fill" /></div>
              <Badge type={selectedEvidence.kind === "事实" ? "fact" : selectedEvidence.kind === "推断" ? "inference" : "uncertain"}>{selectedEvidence.kind}</Badge>
              <h3>{selectedEvidence.title}</h3>
              <p className="source-name">{selectedEvidence.source}</p>
              <div className="meta-list"><span><Clock size={16} />获取时间</span><b>{selectedEvidence.time}</b><span><Database size={16} />新鲜度</span><b>{selectedEvidence.fresh}</b><span><SealCheck size={16} />来源状态</span><b className="verified">已核验</b></div>
              <blockquote>{selectedEvidence.excerpt}</blockquote>
              <p className="method-note">{selectedEvidence.note}</p>
              <button className="source-link" onClick={() => notify("原始证据链接已记录在审计日志中")}>查看来源与字段 <ArrowRight size={16} /></button>
            </div>

            <div className="checkpoint-card"><div className="checkpoint-title"><span className="checkpoint-icon"><ClipboardText size={19} weight="fill" /></span><div><strong>用户检查点</strong><p>在形成正式备忘录前复核范围与反证。</p></div></div>{approved ? <div className="approved-state"><CheckCircle size={21} weight="fill" />已批准继续形成备忘录</div> : <button className="primary-button" onClick={() => setShowApproval(true)}>审阅并批准下一阶段 <ArrowRight size={18} /></button>}</div>

            <button className="recovery-card" onClick={() => setShowRuns(true)}><WarningCircle size={22} weight="fill" /><span><strong>1 项调用已恢复</strong><small>OTIX 渠道接口超时，已切换备用来源；原始失败记录已保留。</small></span><ArrowRight size={17} /></button>
          </aside>
        </div>
      </section>

      {showRuns && <div className="drawer-backdrop" onClick={() => setShowRuns(false)}><aside className="run-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">AGENT HARNESS</span><h2>运行记录与恢复</h2></div><button onClick={() => setShowRuns(false)} aria-label="关闭"><X size={21} /></button></div><div className="run-summary"><span className="live-dot" />本次研究已保存 3 个检查点 · 预计成本 ¥1.84 · 运行 50 分钟</div><div className="run-list">{agentRuns.map(([time, text, status]) => <div className={`run-item ${status}`} key={time}><span>{time}</span><i /><p>{text}</p></div>)}</div><div className="recovery-detail"><WarningCircle size={21} weight="fill" /><div><strong>恢复策略：备用来源已启用</strong><p>OTIX 渠道库存接口在 60 秒后超时。系统未将缺失数据当作正常结果，而是标记缺口、转用已许可的 TechInsights 备用来源，并计划在下一个交易日重试主源。</p></div></div></aside></div>}

      {showApproval && <div className="modal-backdrop" onClick={() => setShowApproval(false)}><section className="modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setShowApproval(false)} aria-label="关闭"><X size={20} /></button><span className="eyebrow">CHECKPOINT REVIEW</span><h2>是否批准进入结论阶段？</h2><p>Agent 将基于已核验的 4 个来源撰写研究备忘录，并保留未解决的需求端不确定性。</p><div className="approval-list"><span><CheckCircle size={18} weight="fill" />主数据源与备用来源均已记录</span><span><CheckCircle size={18} weight="fill" />反方证据将写入风险段落</span><span><WarningCircle size={18} weight="fill" />不生成买卖建议或收益承诺</span></div><div className="modal-actions"><button className="secondary-button" onClick={() => setShowApproval(false)}>返回继续核验</button><button className="primary-button" onClick={approve}>批准并生成备忘录 <ArrowRight size={18} /></button></div></section></div>}

      {showNewResearch && <div className="modal-backdrop" onClick={() => setShowNewResearch(false)}><form className="modal" onSubmit={createResearch} onClick={(event) => event.stopPropagation()}><button type="button" className="close-button" onClick={() => setShowNewResearch(false)} aria-label="关闭"><X size={20} /></button><span className="eyebrow">NEW RESEARCH</span><h2>提出一个研究目标</h2><p>描述你想验证的问题；XBuddy 将先给出可编辑计划，并在高影响节点请求确认。</p><label htmlFor="research-goal">研究目标</label><textarea id="research-goal" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} placeholder="例如：验证高股息策略在利率下行阶段的稳定性" autoFocus /><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewResearch(false)}>取消</button><button className="primary-button" type="submit">创建研究计划 <ArrowRight size={18} /></button></div></form></div>}
      {toast && <div className="toast"><CheckCircle size={18} weight="fill" />{toast}</div>}
    </main>
  );
}

export { App };

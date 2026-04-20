// 全局状态
let allData = { vendors: [], rows: [] };
let links = {};
let activeVendors = new Set();
let activeYear = 'all';
let searchQuery = '';
let sortOrder = 'desc'; // 'desc' = 倒序 (新→旧), 'asc' = 正序 (旧→新)

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadData(), loadLinks()]);
  updateVendorList();
  initFilters();
  render();
  loadChangelog(); // 加载更新日志
});

// 厂商名称映射：英文 -> 中文
const VENDOR_NAMES = {
  'OpenAI': 'OpenAI',
  'Anthropic': 'Anthropic',
  'Google': 'Google',
  'Meta': 'Meta',
  'Mistral': 'Mistral',
  'xAI': 'xAI',
  'DeepSeek': '深度求索',
  'Qwen-Alibaba': '千问',
  'Cohere': 'Cohere',
  'Baidu': '百度',
  'GLM-Z.ai': '智谱',
  'iFlytek': '讯飞',
  'MiniMax': 'MiniMax',
  'Kimi-Moonshot': 'Kimi',
  'Doubao-ByteDance': '字节',
  'Ant-Group': '蚂蚁',
  'StepFun': '阶跃星辰',
  'Xiaomi': '小米',
  'Kuaishou-Kling': '快手可灵',
  'Boss-Nanbeige': 'BOSS直聘南北阁',
  'Huawei': '华为',
  'Tencent': '腾讯',
  '01.AI': '零一万物',
  'Baichuan-Intelligence': '百川',
  'Microsoft': '微软',
  'Apple': '苹果',
  'NVIDIA': '英伟达',
  'Stability': 'Stability',
  'Amazon': '亚马逊',
  'SenseTime': '商汤',
  'AI21': 'AI21',
  'Open-Source': '开源项目',
  'LLM-Applications': 'LLM应用',
  'LLM-芯片': 'LLM芯片',
  'LLM-云计算': 'LLM云计算'
};

// 更新厂商列表描述
function updateVendorList() {
  const el = document.getElementById('vendorList');
  if (el && allData.vendors.length > 0) {
    const names = allData.vendors.map(v => VENDOR_NAMES[v] || v);
    el.textContent = names.join('、');
  }
}

// 加载数据
async function loadData() {
  const res = await fetch('data.json');
  allData = await res.json();
  activeVendors = new Set(allData.vendors);
}

// 加载链接映射
async function loadLinks() {
  try {
    const res = await fetch('links.json');
    links = await res.json();
  } catch (e) {
    links = {};
  }
}

// 加载更新日志
async function loadChangelog() {
  const container = document.getElementById('changelogList');
  if (!container) return;

  try {
    const res = await fetch('https://api.github.com/repos/Physics-Lee/Monthly_Table_of_LLM_Releasing/commits?per_page=3');
    const commits = await res.json();

    container.innerHTML = commits.map(commit => {
      const date = new Date(commit.commit.committer.date);
      const dateStr = date.toLocaleDateString('zh-CN');
      const message = commit.commit.message.split('\n')[0]; // 只取第一行
      const shortHash = commit.sha.substring(0, 7);
      return `
        <div class="changelog-item">
          <span class="changelog-date">${dateStr}</span>
          <span class="changelog-hash">${shortHash}</span>
          <span class="changelog-msg">${message}</span>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<span class="changelog-error">加载失败</span>';
  }
}

// 初始化筛选器
function initFilters() {
  const container = document.getElementById('vendorFilters');
  allData.vendors.forEach(vendor => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${vendor}" checked>
      <span>${vendor}</span>
    `;
    label.querySelector('input').addEventListener('change', () => {
      updateActiveVendors();
      render();
    });
    container.appendChild(label);
  });

  document.getElementById('yearFilter').addEventListener('change', (e) => {
    activeYear = e.target.value;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    activeYear = 'all';
    searchQuery = '';
    sortOrder = 'desc';
    activeVendors = new Set(allData.vendors);
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    const sortBtn = document.getElementById('sortBtn');
    sortBtn.dataset.order = 'desc';
    sortBtn.textContent = '时间倒序';
    container.querySelectorAll('input').forEach(cb => cb.checked = true);
    render();
  });

  document.getElementById('sortBtn').addEventListener('click', () => {
    const btn = document.getElementById('sortBtn');
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    btn.dataset.order = sortOrder;
    btn.textContent = sortOrder === 'desc' ? '时间倒序' : '时间正序';
    render();
  });
}

function updateActiveVendors() {
  activeVendors.clear();
  document.querySelectorAll('#vendorFilters input:checked').forEach(cb => {
    activeVendors.add(cb.value);
  });
}

// 渲染表格
function render() {
  const thead = document.querySelector('#timelineTable thead');
  const tbody = document.querySelector('#timelineTable tbody');

  // 过滤行
  let filteredRows = allData.rows.filter(row => {
    if (activeYear !== 'all') {
      const year = '20' + row.Month.split('-')[0];
      if (year !== activeYear) return false;
    }
    if (searchQuery) {
      const rowText = allData.vendors.map(v => row[v] || '').join(' ').toLowerCase();
      if (!rowText.includes(searchQuery)) return false;
    }
    return true;
  });

  // 排序
  if (sortOrder === 'desc') {
    filteredRows.reverse();
  }

  // 过滤列：只保留 Month + 选中的厂商
  const visibleVendors = ['Month', ...allData.vendors.filter(v => activeVendors.has(v))];

  // 渲染表头
  thead.innerHTML = '<tr>' + visibleVendors.map(v => `<th>${v}</th>`).join('') + '</tr>';

  // 渲染表体
  tbody.innerHTML = filteredRows.map(row => {
    return '<tr>' + visibleVendors.map(vendor => {
      const cell = row[vendor] || '';
      if (vendor === 'Month') {
        return `<td>${cell}</td>`;
      }
      return `<td>${formatCell(cell)}</td>`;
    }).join('') + '</tr>';
  }).join('');

  // 更新统计
  document.getElementById('stats').textContent = `显示 ${filteredRows.length} / ${allData.rows.length} 个月`;
}

function formatCell(text) {
  if (!text) return '';
  // 按 " + " 拆分多个模型
  const models = text.split(' + ').map(s => s.trim()).filter(Boolean);
  if (models.length === 0) return '';

  return models.map(model => {
    const url = findUrl(model);
    if (url) {
      return `<a href="${url}" target="_blank" class="model-link">${model}</a>`;
    }
    return `<span class="model-item-text">${model}</span>`;
  }).map(html => `<span class="model-item">${html}</span>`).join('');
}

// 查找模型对应的 URL
function findUrl(model) {
  // 直接匹配
  if (links[model]) return links[model];

  // 去掉反引号再匹配
  const clean = model.replace(/`/g, '').trim();
  if (links[clean]) return links[clean];

  // 尝试部分匹配（处理 Markdown 中链接文本和 CSV 中模型名略有差异的情况）
  for (const [key, url] of Object.entries(links)) {
    if (key.toLowerCase() === model.toLowerCase()) return url;
    if (key.toLowerCase() === clean.toLowerCase()) return url;
  }

  return null;
}

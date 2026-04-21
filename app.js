// Global state
let allData = { vendors: [], rows: [] };
let links = {};
let activeVendors = new Set();
let activeYear = 'all';
let searchQuery = '';
let sortOrder = 'desc';

const { flattenRowText, normalizeModels } = window.ModelUtils;

const VENDOR_NAMES = {
  'OpenAI': 'OpenAI',
  'Anthropic': 'Anthropic',
  'Google': 'Google',
  'Meta': 'Meta',
  'Mistral': 'Mistral',
  'xAI': 'xAI',
  'DeepSeek': 'DeepSeek',
  'Qwen-Alibaba': 'Qwen',
  'Cohere': 'Cohere',
  'Baidu': 'Baidu',
  'GLM-Z.ai': 'GLM-Z.ai',
  'iFlytek': 'iFlytek',
  'MiniMax': 'MiniMax',
  'Kimi-Moonshot': 'Kimi',
  'Doubao-ByteDance': 'Doubao',
  'Ant-Group': 'Ant Group',
  'StepFun': 'StepFun',
  'Xiaomi': 'Xiaomi',
  'Kuaishou-Kling': 'Kuaishou Kling',
  'Boss-Nanbeige': 'Boss Nanbeige',
  'Huawei': 'Huawei',
  'Tencent': 'Tencent',
  '01.AI': '01.AI',
  'Baichuan-Intelligence': 'Baichuan',
  'Microsoft': 'Microsoft',
  'Apple': 'Apple',
  'NVIDIA': 'NVIDIA',
  'Stability': 'Stability',
  'Amazon': 'Amazon',
  'SenseTime': 'SenseTime',
  'AI21': 'AI21',
  'Open-Source': 'Open Source',
  'LLM-Applications': 'LLM Applications',
  'AI-Chips': 'AI Chips',
  'AI-Cloud': 'AI Cloud'
};

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadData(), loadLinks()]);
  updateVendorList();
  initFilters();
  render();
  loadChangelog();
});

function updateVendorList() {
  const el = document.getElementById('vendorList');
  if (!el || allData.vendors.length === 0) return;

  const names = allData.vendors.map(vendor => VENDOR_NAMES[vendor] || vendor);
  el.textContent = names.join('、');
}

async function loadData() {
  const res = await fetch('data.json');
  allData = await res.json();
  activeVendors = new Set(allData.vendors);
}

async function loadLinks() {
  try {
    const res = await fetch('links.json');
    links = await res.json();
  } catch (error) {
    links = {};
  }
}

async function loadChangelog() {
  const container = document.getElementById('changelogList');
  if (!container) return;

  try {
    const res = await fetch('https://api.github.com/repos/Physics-Lee/Monthly_Table_of_LLM_Releasing/commits?per_page=3');
    const commits = await res.json();

    container.innerHTML = commits.map(commit => {
      const date = new Date(commit.commit.committer.date);
      const dateStr = date.toLocaleDateString('zh-CN');
      const message = commit.commit.message.split('\n')[0];
      const shortHash = commit.sha.substring(0, 7);

      return `
        <div class="changelog-item">
          <span class="changelog-date">${dateStr}</span>
          <span class="changelog-hash">${shortHash}</span>
          <span class="changelog-msg">${message}</span>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<span class="changelog-error">加载失败</span>';
  }
}

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

  document.getElementById('yearFilter').addEventListener('change', event => {
    activeYear = event.target.value;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', event => {
    searchQuery = event.target.value.toLowerCase().trim();
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

    container.querySelectorAll('input').forEach(checkbox => {
      checkbox.checked = true;
    });

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
  document.querySelectorAll('#vendorFilters input:checked').forEach(checkbox => {
    activeVendors.add(checkbox.value);
  });
}

function render() {
  const thead = document.querySelector('#timelineTable thead');
  const tbody = document.querySelector('#timelineTable tbody');

  let filteredRows = allData.rows.filter(row => {
    if (activeYear !== 'all') {
      const year = `20${row.Month.split('-')[0]}`;
      if (year !== activeYear) return false;
    }

    if (searchQuery) {
      const rowText = flattenRowText(row, allData.vendors).toLowerCase();
      if (!rowText.includes(searchQuery)) return false;
    }

    return true;
  });

  if (sortOrder === 'desc') {
    filteredRows = [...filteredRows].reverse();
  }

  const visibleVendors = ['Month', ...allData.vendors.filter(vendor => activeVendors.has(vendor))];

  thead.innerHTML = `<tr>${visibleVendors.map(vendor => `<th>${vendor}</th>`).join('')}</tr>`;

  tbody.innerHTML = filteredRows.map(row => {
    return `<tr>${visibleVendors.map(vendor => {
      const cell = row[vendor];
      if (vendor === 'Month') {
        return `<td>${cell || ''}</td>`;
      }

      return `<td>${formatCell(cell)}</td>`;
    }).join('')}</tr>`;
  }).join('');

  document.getElementById('stats').textContent = `显示 ${filteredRows.length} / ${allData.rows.length} 个月`;
}

function formatCell(value) {
  const models = normalizeModels(value);
  if (models.length === 0) return '';

  return models.map(model => {
    const url = findUrl(model);
    if (url) {
      return `<a href="${url}" target="_blank" class="model-link">${model}</a>`;
    }

    return `<span class="model-item-text">${model}</span>`;
  }).map(html => `<span class="model-item">${html}</span>`).join('');
}

function findUrl(model) {
  if (links[model]) return links[model];

  const clean = model.replace(/`/g, '').trim();
  if (links[clean]) return links[clean];

  for (const [key, url] of Object.entries(links)) {
    if (key.toLowerCase() === model.toLowerCase()) return url;
    if (key.toLowerCase() === clean.toLowerCase()) return url;
  }

  return null;
}

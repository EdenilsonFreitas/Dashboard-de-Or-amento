// Dados consolidados das duas planilhas
const totalBudget = 150000.00;
const reserveValue = 7838.72; // 10% Reserva de montagem/frete

const itemsData = [
    // Planilha 1: Mobiliário e Infraestrutura Geral
    { origin: "Mobiliario", category: "Área de Trabalho", item: "Estações de trabalho, cadeiras e gaveteiros", qty: 1, unitVal: 12071.11, obs: "Subtotal mobiliário operacional" },
    { origin: "Mobiliario", category: "Sala de Reunião", item: "Mesa de reunião, cadeiras e suporte multimídia", qty: 1, unitVal: 7874.98, obs: "Mobiliário da sala principal" },
    { origin: "Mobiliario", category: "Recepção", item: "Balcão recepção e sofás de espera", qty: 1, unitVal: 7036.86, obs: "Recepção da matriz" },
    { origin: "Mobiliario", category: "Climatização", item: "Aparelhos de Ar Condicionado Split", qty: 1, unitVal: 5811.72, obs: "Climatização dos ambientes" },
    { origin: "Mobiliario", category: "Copa", item: "Eletrodomésticos e armários da copa", qty: 1, unitVal: 2205.13, obs: "Área de convivência" },
    { origin: "Mobiliario", category: "Material de Consumo", item: "Suprimentos iniciais de escritório", qty: 1, unitVal: 579.00, obs: "Kits de escritório" },
    { origin: "Mobiliario", category: "Segurança", item: "Extintores e sinalização de emergência", qty: 1, unitVal: 392.78, obs: "Itens de segurança predial" },
    { origin: "Mobiliario", category: "Outros Itens Diversos", item: "Diversos itens da lista de compras", qty: 1, unitVal: 42415.57, obs: "Outras aquisições mapeadas" },

    // Planilha 2: Infraestrutura Técnica de TI
    { origin: "TI", category: "Rede Ativa", item: "Switches gerenciáveis (matriz e filial)", qty: 1, unitVal: 598.13, obs: "Depende das VLANs e número de pontos" },
    { origin: "TI", category: "Rede Ativa", item: "Roteadores (matriz e filial)", qty: 1, unitVal: 398.05, obs: "Ligação entre unidades (VPN site a site)" },
    { origin: "TI", category: "Rede Ativa", item: "Firewall Cisco ASA", qty: 1, unitVal: 2200.00, obs: "Segurança perimétrica de rede" },
    { origin: "TI", category: "Rede Ativa", item: "Access points Wi-Fi", qty: 1, unitVal: 593.99, obs: "Cobertura de sinal conforme planta" },
    { origin: "TI", category: "Servidores", item: "Servidor físico / Host de Virtualização", qty: 1, unitVal: 6900.00, obs: "Serviços Linux: DHCP, DNS, Web, Proxy, VPN" },
    { origin: "TI", category: "Servidores", item: "Storage/NAS para backup", qty: 1, unitVal: 3200.00, obs: "Depende da política de backup" },
    { origin: "TI", category: "Infraestrutura Física", item: "Rack 19\" (matriz e filial)", qty: 2, unitVal: 2100.00, obs: "Racks de telecomunicação" },
    { origin: "TI", category: "Infraestrutura Física", item: "Patch panel, organizadores e bandejas", qty: 2, unitVal: 950.00, obs: "Organização do rack" },
    { origin: "TI", category: "Cabeamento", item: "Cabo UTP Cat6, tomadas, patch cords e canaletas", qty: 1, unitVal: 2200.00, obs: "Metragem da planta AutoCAD" },
    { origin: "TI", category: "Energia", item: "Nobreak e filtros de linha", qty: 2, unitVal: 2300.00, obs: "Proteção elétrica e autonomia" }
];

// Formatação para Real (BRL)
function formatBRL(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicialização e Cálculos
document.addEventListener('DOMContentLoaded', () => {
    renderKPIs();
    renderTable(itemsData);
    initCharts();

    document.getElementById('searchInput').addEventListener('input', filterData);
    document.getElementById('filterCategory').addEventListener('change', filterData);
});

function calculateTotals() {
    const totalSpent = itemsData.reduce((acc, curr) => acc + (curr.qty * curr.unitVal), 0) + reserveValue;
    const mobTotal = itemsData.filter(i => i.origin === 'Mobiliario').reduce((acc, curr) => acc + (curr.qty * curr.unitVal), 0);
    const tiTotal = itemsData.filter(i => i.origin === 'TI').reduce((acc, curr) => acc + (curr.qty * curr.unitVal), 0);
    const balance = totalBudget - totalSpent;
    const percentSpent = ((totalSpent / totalBudget) * 100).toFixed(1);

    return { totalSpent, mobTotal, tiTotal, balance, percentSpent };
}

function renderKPIs() {
    const { totalSpent, balance, percentSpent } = calculateTotals();

    document.getElementById('kpi-spent').innerText = formatBRL(totalSpent);
    document.getElementById('kpi-percent').innerText = `${percentSpent}% do orçamento utilizado`;
    document.getElementById('kpi-reserve').innerText = formatBRL(reserveValue);
    document.getElementById('kpi-balance').innerText = formatBRL(balance);

    const fill = document.getElementById('progress-fill');
    fill.style.width = `${percentSpent}%`;
    document.getElementById('progress-text').innerText = `${percentSpent}%`;
}

function renderTable(data) {
    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const total = row.qty * row.unitVal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="${row.origin === 'TI' ? 'badge-ti' : 'badge-mob'}">${row.origin === 'TI' ? 'TI & Rede' : 'Mobiliário'}</span></td>
            <td><strong>${row.category}</strong><br><small style="color:#94a3b8">${row.item}</small></td>
            <td>${row.qty}</td>
            <td>${formatBRL(row.unitVal)}</td>
            <td><strong>${formatBRL(total)}</strong></td>
            <td><small style="color:#94a3b8">${row.obs}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

function filterData() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;

    const filtered = itemsData.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(search) || 
                              item.item.toLowerCase().includes(search) ||
                              item.obs.toLowerCase().includes(search);
        const matchesCat = category === 'ALL' || item.origin === category;
        return matchesSearch && matchesCat;
    });

    renderTable(filtered);
}

function initCharts() {
    // Agrupamento por Categoria
    const categoriesMap = {};
    itemsData.forEach(i => {
        const total = i.qty * i.unitVal;
        categoriesMap[i.category] = (categoriesMap[i.category] || 0) + total;
    });

    const catLabels = Object.keys(categoriesMap);
    const catValues = Object.values(categoriesMap);

    // Gráfico de Barras - Categorias
    new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: {
            labels: catLabels,
            datasets: [{
                label: 'Custo Total (R$)',
                data: catValues,
                backgroundColor: '#38bdf8',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });

    // Gráfico de Pizza - Mobiliário vs. TI
    const { mobTotal, tiTotal } = calculateTotals();
    new Chart(document.getElementById('sectorChart'), {
        type: 'doughnut',
        data: {
            labels: ['Mobiliário/Compras', 'Infraestrutura TI', 'Reserva Frete/Montagem'],
            datasets: [{
                data: [mobTotal, tiTotal, reserveValue],
                backgroundColor: ['#0d9488', '#0284c7', '#a855f7']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f8fafc' }, position: 'bottom' }
            }
        }
    });
}
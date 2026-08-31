import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { expenses, categories, monthlyBudget, setMonthlyBudget } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);

  // Filter expenses by selected month
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // Category aggregations for Pie Chart
  const categorySpendMap: { [catId: string]: { name: string; color: string; amount: number; count: number } } = {};

  // Initialize with all categories
  categories.forEach((cat) => {
    categorySpendMap[cat.id] = { name: cat.name, color: cat.color, amount: 0, count: 0 };
  });

  monthlyExpenses.forEach((exp) => {
    if (categorySpendMap[exp.categoryId]) {
      categorySpendMap[exp.categoryId].amount += exp.amount;
      categorySpendMap[exp.categoryId].count += exp.itemCount || 1;
    } else {
      const cat = categories.find((c) => c.id === exp.categoryId);
      categorySpendMap[exp.categoryId] = {
        name: exp.categoryName || cat?.name || 'Diğer',
        color: cat?.color || '#8b5cf6',
        amount: exp.amount,
        count: exp.itemCount || 1,
      };
    }
  });

  const pieChartData = Object.values(categorySpendMap)
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: c.name,
      value: Math.round(c.amount),
      color: c.color,
    }));

  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetUsagePercent = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  // Weekly bar chart calculation (4 weeks in the month)
  const weeklyData = [
    { name: '1. Hafta', tutar: 0 },
    { name: '2. Hafta', tutar: 0 },
    { name: '3. Hafta', tutar: 0 },
    { name: '4. Hafta', tutar: 0 },
  ];

  monthlyExpenses.forEach((exp) => {
    const day = parseInt(exp.date.split('-')[2], 10) || 1;
    if (day <= 7) weeklyData[0].tutar += exp.amount;
    else if (day <= 14) weeklyData[1].tutar += exp.amount;
    else if (day <= 21) weeklyData[2].tutar += exp.amount;
    else weeklyData[3].tutar += exp.amount;
  });

  // Top spending categories ranked
  const rankedCategories = Object.entries(categorySpendMap)
    .filter(([_, data]) => data.amount > 0)
    .sort((a, b) => b[1].amount - a[1].amount);

  // Filtered expense log list
  const displayExpenses = filterCategoryId
    ? monthlyExpenses.filter((e) => e.categoryId === filterCategoryId)
    : monthlyExpenses;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Harcama Analizi & Raporlar
              </h1>
              <p className="text-[11px] text-slate-500">
                Kategorik Bütçe ve Trend Grafikleri
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-2 py-0.5"
            >
              <option value="2026-08">Ağustos 2026</option>
              <option value="2026-07">Temmuz 2026</option>
              <option value="2026-06">Haziran 2026</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Spent Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Toplam Harcama
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {totalSpent.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" />
              {monthlyExpenses.length} Alışveriş Kaydı
            </p>
          </div>

          {/* Budget Limit Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Aylık Hedef Bütçe
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {monthlyBudget.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Önerilen Tavan
            </p>
          </div>

          {/* Remaining Budget Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Kalan Bütçe
            </p>
            <p
              className={`text-lg sm:text-xl font-black mt-1 ${
                remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {remainingBudget.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {remainingBudget >= 0 ? 'Bütçe Dahilinde' : 'Bütçe Aşıldı'}
            </p>
          </div>

          {/* Budget Usage % */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Bütçe Kullanımı
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              %{budgetUsagePercent}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetUsagePercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts Section: Pie (Donut) & Bar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Donut Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  Kategorilere Göre Harcama Dağılımı
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Halka Grafik</span>
              </div>
              <p className="text-xs text-slate-500">
                Seçili aydaki harcamaların sektör bazlı oransal dökümü
              </p>
            </div>

            {pieChartData.length > 0 ? (
              <div className="h-64 sm:h-72 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`, 'Harcama']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                Bu ay için henüz harcama kaydı yok.
              </div>
            )}

            {/* Custom Pie Chart Legend */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
              {pieChartData.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 truncate text-[11px]">{item.name}:</span>
                  <span className="font-bold text-slate-900 text-[11px]">
                    {item.value.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Haftalık Harcama Trendi
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Sütun Grafik</span>
              </div>
              <p className="text-xs text-slate-500">
                Haftalık bütçe akışı ve yoğun alışveriş dönemleri
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`, 'Tutar']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Bar dataKey="tutar" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              En çok harcama yapılan hafta:{' '}
              <strong className="text-slate-900 font-bold">
                {weeklyData.reduce((prev, current) => (prev.tutar > current.tutar ? prev : current)).name}
              </strong>
            </div>
          </div>
        </div>

        {/* Ranked Categories Breakdown List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            Kategori Harcama Sıralaması (Leaderboard)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Bütçenizin nereye gittiğini en yüksekten en düşüğe inceleyin
          </p>

          <div className="space-y-3">
            {rankedCategories.map(([catId, data], index) => {
              const percent = totalSpent > 0 ? Math.round((data.amount / totalSpent) * 100) : 0;
              return (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="font-bold text-slate-800">{data.name}</span>
                      <span className="text-[10px] text-slate-400">({data.count} Ürün)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{data.amount.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-[11px] text-slate-500 ml-1.5 font-medium">%{percent}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: data.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Logs Timeline */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Alışveriş & Harcama Geçmişi
              </h3>
              <p className="text-xs text-slate-500">
                Arşivlenen alışveriş sepeti ve manuel harcama kayıtları
              </p>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCategoryId || ''}
                onChange={(e) => setFilterCategoryId(e.target.value || null)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {displayExpenses.length > 0 ? (
              displayExpenses.map((exp) => {
                const cat = categories.find((c) => c.id === exp.categoryId);
                return (
                  <div
                    key={exp.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold"
                        style={{ backgroundColor: cat?.color || '#10b981' }}
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {exp.listTitle || 'Alışveriş Sepeti'}
                          </p>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.2 rounded-md"
                            style={{ backgroundColor: cat?.bgLight, color: cat?.color }}
                          >
                            {exp.categoryName || cat?.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {exp.itemsSummary?.join(', ') || `${exp.itemCount} adet ürün`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900 text-sm">
                        {exp.amount.toLocaleString('tr-TR')} ₺
                      </p>
                      <p className="text-[10px] text-slate-400">{exp.date}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Filtreye uygun harcama kaydı bulunamadı.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

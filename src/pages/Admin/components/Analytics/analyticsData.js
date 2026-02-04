// Advanced Analytics Mock Data Generator
// This module generates realistic mock data for the analytics dashboard

// Helper functions
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const formatDate = (date) => date.toISOString().split('T')[0];

// Generate date range
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Sales data generator
export const generateSalesData = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const dates = generateDateRange(startDate, endDate);
  
  return dates.map((date, index) => {
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
    const seasonality = Math.sin((index / 7) * Math.PI) * 0.3 + 0.7;
    const baseRevenue = isWeekend ? random(8000, 15000) : random(5000, 12000);
    const revenue = Math.floor(baseRevenue * seasonality * randomFloat(0.8, 1.2));
    const orders = Math.floor(revenue / randomFloat(80, 150));
    const visitors = random(800, 2500);
    
    return {
      date,
      revenue,
      orders,
      averageOrderValue: (revenue / orders).toFixed(2),
      visitors,
      conversionRate: ((orders / visitors) * 100).toFixed(2),
      returningCustomers: Math.floor(orders * randomFloat(0.25, 0.45)),
      newCustomers: Math.floor(orders * randomFloat(0.55, 0.75)),
    };
  });
};

// Product performance data
export const generateProductPerformanceData = () => {
  const products = [
    { id: 1, name: 'Nike Air Max 90', brand: 'Nike', category: 'Running' },
    { id: 2, name: 'Adidas Ultraboost 22', brand: 'Adidas', category: 'Running' },
    { id: 3, name: 'Nike Air Jordan 1', brand: 'Nike', category: 'Basketball' },
    { id: 4, name: 'New Balance 574', brand: 'New Balance', category: 'Casual' },
    { id: 5, name: 'Puma Suede Classic', brand: 'Puma', category: 'Casual' },
    { id: 6, name: 'Converse Chuck 70', brand: 'Converse', category: 'Casual' },
    { id: 7, name: 'Nike Air Force 1', brand: 'Nike', category: 'Casual' },
    { id: 8, name: 'Adidas Stan Smith', brand: 'Adidas', category: 'Casual' },
    { id: 9, name: 'Vans Old Skool', brand: 'Vans', category: 'Skate' },
    { id: 10, name: 'Reebok Classic', brand: 'Reebok', category: 'Casual' },
    { id: 11, name: 'Under Armour HOVR', brand: 'Under Armour', category: 'Running' },
    { id: 12, name: 'Asics Gel-Nimbus', brand: 'Asics', category: 'Running' },
  ];

  return products.map(product => ({
    ...product,
    unitsSold: random(50, 500),
    revenue: random(5000, 50000),
    views: random(1000, 10000),
    conversionRate: randomFloat(2, 15),
    inventory: random(10, 200),
    lastSold: formatDate(new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000)),
    daysSinceLastSale: random(0, 30),
    turnoverRate: randomFloat(0.5, 5).toFixed(2),
  }));
};

// Category breakdown
export const generateCategoryData = () => [
  { name: 'Running', value: random(25, 35), revenue: random(50000, 80000), units: random(500, 1000), color: '#3B82F6' },
  { name: 'Casual', value: random(25, 35), revenue: random(40000, 70000), units: random(400, 900), color: '#10B981' },
  { name: 'Basketball', value: random(10, 20), revenue: random(20000, 40000), units: random(150, 400), color: '#F59E0B' },
  { name: 'Training', value: random(8, 15), revenue: random(15000, 30000), units: random(100, 300), color: '#8B5CF6' },
  { name: 'Skate', value: random(5, 12), revenue: random(10000, 25000), units: random(80, 250), color: '#EC4899' },
  { name: 'Other', value: random(3, 8), revenue: random(5000, 15000), units: random(50, 150), color: '#6B7280' },
];

// Brand performance
export const generateBrandData = () => [
  { name: 'Nike', revenue: random(150000, 250000), units: random(1500, 2500), growth: randomFloat(-10, 30), color: '#FF6B6B' },
  { name: 'Adidas', revenue: random(100000, 180000), units: random(1000, 1800), growth: randomFloat(-5, 25), color: '#4ECDC4' },
  { name: 'New Balance', revenue: random(50000, 90000), units: random(500, 900), growth: randomFloat(5, 35), color: '#45B7D1' },
  { name: 'Puma', revenue: random(40000, 70000), units: random(400, 700), growth: randomFloat(-8, 20), color: '#96CEB4' },
  { name: 'Converse', revenue: random(30000, 60000), units: random(300, 600), growth: randomFloat(-3, 15), color: '#FFEAA7' },
  { name: 'Vans', revenue: random(25000, 50000), units: random(250, 500), growth: randomFloat(-5, 18), color: '#DDA0DD' },
  { name: 'Other', revenue: random(30000, 60000), units: random(300, 600), growth: randomFloat(-10, 25), color: '#C0C0C0' },
];

// Size distribution
export const generateSizeData = () => [
  { size: '38', units: random(80, 150), percentage: random(5, 10) },
  { size: '39', units: random(120, 200), percentage: random(8, 14) },
  { size: '40', units: random(180, 280), percentage: random(12, 18) },
  { size: '41', units: random(220, 350), percentage: random(15, 22) },
  { size: '42', units: random(200, 320), percentage: random(14, 20) },
  { size: '43', units: random(160, 260), percentage: random(11, 16) },
  { size: '44', units: random(100, 180), percentage: random(7, 12) },
  { size: '45', units: random(60, 120), percentage: random(4, 8) },
  { size: '46', units: random(30, 70), percentage: random(2, 5) },
];

// Color distribution
export const generateColorData = () => [
  { name: 'Black', value: random(25, 35), hex: '#1F2937' },
  { name: 'White', value: random(20, 30), hex: '#F9FAFB' },
  { name: 'Gray', value: random(10, 18), hex: '#9CA3AF' },
  { name: 'Blue', value: random(8, 15), hex: '#3B82F6' },
  { name: 'Red', value: random(5, 12), hex: '#EF4444' },
  { name: 'Green', value: random(4, 10), hex: '#10B981' },
  { name: 'Brown', value: random(3, 8), hex: '#92400E' },
  { name: 'Other', value: random(3, 7), hex: '#8B5CF6' },
];

// Customer analytics
export const generateCustomerData = () => {
  const totalCustomers = random(5000, 15000);
  const newCustomers = Math.floor(totalCustomers * randomFloat(0.1, 0.2));
  
  return {
    totalCustomers,
    newCustomers,
    returningCustomers: totalCustomers - newCustomers,
    newVsReturningRatio: ((newCustomers / totalCustomers) * 100).toFixed(1),
    averageOrdersPerCustomer: randomFloat(2, 8),
    averageCustomerLifetime: randomFloat(1, 5).toFixed(1),
    customerLifetimeValue: randomFloat(150, 800),
    purchaseFrequency: {
      '1-time': random(30, 45),
      '2-3 times': random(25, 35),
      '4-6 times': random(15, 25),
      '7+ times': random(5, 15),
    },
    cohortData: Array.from({ length: 6 }, (_, i) => ({
      cohort: `Month ${i + 1}`,
      retention: Array.from({ length: 6 - i }, (_, j) => ({
        month: j,
        rate: randomFloat(20, 80) * (1 - j * 0.1),
      })),
    })),
    geographicDistribution: [
      { region: 'Ho Chi Minh City', customers: random(2000, 4000), percentage: random(30, 40) },
      { region: 'Hanoi', customers: random(1500, 3000), percentage: random(20, 30) },
      { region: 'Da Nang', customers: random(500, 1200), percentage: random(8, 12) },
      { region: 'Hai Phong', customers: random(300, 800), percentage: random(5, 8) },
      { region: 'Can Tho', customers: random(200, 600), percentage: random(3, 6) },
      { region: 'Others', customers: random(500, 1500), percentage: random(10, 20) },
    ],
  };
};

// Funnel data
export const generateFunnelData = () => {
  const pageViews = random(50000, 100000);
  const productViews = Math.floor(pageViews * randomFloat(0.4, 0.6));
  const addToCart = Math.floor(productViews * randomFloat(0.15, 0.25));
  const checkout = Math.floor(addToCart * randomFloat(0.4, 0.6));
  const payment = Math.floor(checkout * randomFloat(0.7, 0.9));
  
  return [
    { stage: 'Page Views', value: pageViews, percentage: 100, color: '#3B82F6' },
    { stage: 'Product Views', value: productViews, percentage: ((productViews / pageViews) * 100).toFixed(1), color: '#10B981' },
    { stage: 'Add to Cart', value: addToCart, percentage: ((addToCart / pageViews) * 100).toFixed(1), color: '#F59E0B' },
    { stage: 'Checkout', value: checkout, percentage: ((checkout / pageViews) * 100).toFixed(1), color: '#8B5CF6' },
    { stage: 'Payment', value: payment, percentage: ((payment / pageViews) * 100).toFixed(1), color: '#EC4899' },
  ];
};

// Hourly traffic data
export const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, hour) => {
    let baseTraffic;
    if (hour >= 6 && hour <= 9) {
      baseTraffic = random(200, 400); // Morning rush
    } else if (hour >= 12 && hour <= 14) {
      baseTraffic = random(300, 500); // Lunch break
    } else if (hour >= 18 && hour <= 22) {
      baseTraffic = random(500, 900); // Evening peak
    } else if (hour >= 23 || hour <= 5) {
      baseTraffic = random(50, 150); // Night low
    } else {
      baseTraffic = random(150, 300); // Daytime
    }
    
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      traffic: baseTraffic,
      orders: Math.floor(baseTraffic * randomFloat(0.02, 0.05)),
      conversionRate: randomFloat(2, 8).toFixed(2),
    };
  });
};

// Weekly pattern
export const generateWeeklyPattern = () => [
  { day: 'Mon', traffic: random(3000, 5000), orders: random(150, 300), revenue: random(15000, 30000) },
  { day: 'Tue', traffic: random(3000, 5000), orders: random(150, 300), revenue: random(15000, 30000) },
  { day: 'Wed', traffic: random(3000, 5000), orders: random(150, 300), revenue: random(15000, 30000) },
  { day: 'Thu', traffic: random(3500, 5500), orders: random(180, 350), revenue: random(18000, 35000) },
  { day: 'Fri', traffic: random(4000, 6000), orders: random(200, 400), revenue: random(20000, 40000) },
  { day: 'Sat', traffic: random(5000, 8000), orders: random(250, 500), revenue: random(25000, 50000) },
  { day: 'Sun', traffic: random(4500, 7000), orders: random(220, 450), revenue: random(22000, 45000) },
];

// Sales forecast (predictive analytics)
export const generateForecastData = (days = 30) => {
  const historicalData = generateSalesData(days);
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  
  const forecast = historicalData.map((day, index) => ({
    ...day,
    isForecast: false,
    type: 'historical',
  }));
  
  // Generate future predictions
  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    const dayOfWeek = futureDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseRevenue = isWeekend ? random(10000, 18000) : random(6000, 14000);
    const trend = 1 + (i * 0.005); // Slight upward trend
    
    forecast.push({
      date: formatDate(futureDate),
      revenue: Math.floor(baseRevenue * trend),
      orders: Math.floor((baseRevenue / randomFloat(100, 130)) * trend),
      isForecast: true,
      type: 'forecast',
      confidence: Math.max(60, 95 - i * 1.5).toFixed(0),
      lowerBound: Math.floor(baseRevenue * trend * 0.85),
      upperBound: Math.floor(baseRevenue * trend * 1.15),
    });
  }
  
  return forecast;
};

// AI Insights generator
export const generateInsights = () => [
  {
    id: 1,
    type: 'positive',
    title: 'Sales Surge Detected',
    message: 'Revenue increased by 18.5% this week compared to last week, driven primarily by Nike brand products (+25%).',
    metric: '+18.5%',
    icon: '📈',
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'info',
    title: 'Size Trend Alert',
    message: 'Size 42 continues to be the most popular size this month, accounting for 22% of all sales. Consider increasing inventory.',
    metric: 'Size 42: 22%',
    icon: '👟',
    timestamp: new Date().toISOString(),
  },
  {
    id: 3,
    type: 'warning',
    title: 'Low Stock Warning',
    message: '3 products are at risk of running out of stock within the next 7 days based on current sales velocity.',
    metric: '3 items',
    icon: '⚠️',
    timestamp: new Date().toISOString(),
  },
  {
    id: 4,
    type: 'neutral',
    title: 'Peak Shopping Hours',
    message: 'Peak shopping activity occurs between 19:00-22:00, with the highest conversion rate at 20:00 (6.5%).',
    metric: '19:00-22:00',
    icon: '⏰',
    timestamp: new Date().toISOString(),
  },
  {
    id: 5,
    type: 'positive',
    title: 'Customer Retention',
    message: 'Customer repeat purchase rate improved by 12% this month. Average order value for returning customers is 35% higher.',
    metric: '+12%',
    icon: '🔄',
    timestamp: new Date().toISOString(),
  },
];

// Inventory health data
export const generateInventoryHealth = () => {
  const products = generateProductPerformanceData();
  
  return {
    healthy: products.filter(p => p.inventory > 30).length,
    warning: products.filter(p => p.inventory > 10 && p.inventory <= 30).length,
    critical: products.filter(p => p.inventory <= 10 && p.inventory > 0).length,
    outOfStock: products.filter(p => p.inventory === 0).length,
    deadStock: products.filter(p => p.daysSinceLastSale > 60).length,
    totalValue: products.reduce((sum, p) => sum + p.revenue, 0),
    products,
    recommendations: [
      'Increase inventory for Nike Air Max 90 (high demand)',
      'Consider markdown for Converse Chuck 70 (slow moving)',
      'Reorder Under Armour HOVR (low stock)',
      'Discontinue Reebok Classic (dead stock)',
    ],
  };
};

// KPI Cards data
export const generateKPIData = () => {
  const currentPeriod = generateSalesData(30).reduce((acc, day) => ({
    revenue: acc.revenue + day.revenue,
    orders: acc.orders + day.orders,
    visitors: acc.visitors + day.visitors,
  }), { revenue: 0, orders: 0, visitors: 0 });
  
  const previousPeriod = generateSalesData(30).reduce((acc, day) => ({
    revenue: acc.revenue + day.revenue,
    orders: acc.orders + day.orders,
    visitors: acc.visitors + day.visitors,
  }), { revenue: 0, orders: 0, visitors: 0 });
  
  const revenueGrowth = ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue * 100).toFixed(1);
  const ordersGrowth = ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders * 100).toFixed(1);
  const aov = (currentPeriod.revenue / currentPeriod.orders).toFixed(2);
  const conversionRate = ((currentPeriod.orders / currentPeriod.visitors) * 100).toFixed(2);
  
  return {
    totalRevenue: currentPeriod.revenue,
    totalOrders: currentPeriod.orders,
    averageOrderValue: aov,
    conversionRate,
    revenueGrowth: parseFloat(revenueGrowth),
    ordersGrowth: parseFloat(ordersGrowth),
    previousRevenue: previousPeriod.revenue,
    previousOrders: previousPeriod.orders,
  };
};

// Time comparison data
export const generateComparisonData = (period = 'week') => {
  const thisPeriod = generateSalesData(period === 'week' ? 7 : 30);
  const prevStart = period === 'week' ? 14 : 60;
  const prevPeriod = generateSalesData(period === 'week' ? 7 : 30, prevStart);
  
  const thisTotal = thisPeriod.reduce((sum, d) => sum + d.revenue, 0);
  const prevTotal = prevPeriod.reduce((sum, d) => sum + d.revenue, 0);
  const growth = ((thisTotal - prevTotal) / prevTotal * 100).toFixed(1);
  
  return {
    thisPeriod: thisPeriod.map(d => ({ ...d, period: 'current' })),
    previousPeriod: prevPeriod.map(d => ({ ...d, period: 'previous' })),
    thisTotal,
    previousTotal: prevTotal,
    growth: parseFloat(growth),
  };
};

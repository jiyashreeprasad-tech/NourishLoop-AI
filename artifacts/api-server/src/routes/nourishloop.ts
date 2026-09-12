import { Router, type IRouter } from "express";
import {
  AcceptSurplusMatchParams,
  CreateInventoryBody,
  CreateSurplusBody,
  GenerateForecastBody,
  GetForecastsQueryParams,
  GetInventoryQueryParams,
  GetSurplusQueryParams,
  OptimizeRouteBody,
  SimulateDemoBody,
  UpdateAlertBody,
  UpdateAlertParams,
  UpdateInventoryBody,
  UpdateInventoryParams,
  UpdateSurplusBody,
  UpdateSurplusParams,
} from "@workspace/api-zod";

type Forecast = {
  id: string;
  forecastDate: string;
  mealType: string;
  predictedMeals: number;
  recommendedProduction: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  explanation: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiresAt: string;
  storageZone: string;
  temperature: number;
  risk: number;
  freshness: number;
  status: string;
  servings: number;
  batch?: string;
  allergens?: string[];
};

type StorageZone = {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  status: string;
  history: number[];
};

type SurplusBatch = {
  id: string;
  foodName: string;
  servings: number;
  preparedAt: string;
  bestBefore: string;
  status: string;
  dietaryTags: string[];
  qualityStatus: string;
  location: string;
  valueInr: number;
  progress: number;
};

type Match = {
  id: string;
  partnerId: string;
  partnerName: string;
  score: number;
  distanceKm: number;
  pickupMinutes: number;
  reason: string;
  status: string;
};

type Route = {
  id: string;
  title: string;
  status: string;
  distanceKm: number;
  durationMinutes: number;
  emissionsKg: number;
  stops: { name: string; type: string; eta: string }[];
};

type Alert = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  relatedId: string | null;
};

type ActivityEvent = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: string;
};

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const dateLabel = (offset: number) => {
  const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-IN", { weekday: "short" });
};

const makeInitialState = () => ({
  forecasts: [
    {
      id: "fc-lunch",
      forecastDate: new Date(Date.now() + 86400000).toISOString(),
      mealType: "Lunch",
      predictedMeals: 420,
      recommendedProduction: 440,
      lowerBound: 388,
      upperBound: 452,
      confidence: 92,
      explanation:
        "Tuesday lunch demand is trending 12% lower than Monday, with rain expected and attendance historically softer.",
    },
    {
      id: "fc-breakfast",
      forecastDate: new Date(Date.now() + 86400000).toISOString(),
      mealType: "Breakfast",
      predictedMeals: 290,
      recommendedProduction: 305,
      lowerBound: 270,
      upperBound: 318,
      confidence: 88,
      explanation:
        "Breakfast demand is stable, with a small uplift from the mid-week training cohort.",
    },
    {
      id: "fc-snack",
      forecastDate: new Date(Date.now() + 86400000).toISOString(),
      mealType: "Snack",
      predictedMeals: 220,
      recommendedProduction: 230,
      lowerBound: 200,
      upperBound: 246,
      confidence: 84,
      explanation:
        "Snack demand is consistent with the last four Tuesdays and has low variance.",
    },
    {
      id: "fc-dinner",
      forecastDate: new Date(Date.now() + 86400000).toISOString(),
      mealType: "Dinner",
      predictedMeals: 250,
      recommendedProduction: 264,
      lowerBound: 232,
      upperBound: 278,
      confidence: 86,
      explanation:
        "Dinner demand follows the weekly average with a 4% attendance adjustment.",
    },
  ] as Forecast[],
  inventory: [
    {
      id: "inv-paneer",
      name: "Paneer curry",
      category: "Prepared food",
      quantity: 65,
      unit: "portions",
      expiresAt: hoursFromNow(3.4),
      storageZone: "Cold Storage B",
      temperature: 6.2,
      risk: 46,
      freshness: 71,
      status: "monitor",
      servings: 65,
      batch: "PC-2409",
      allergens: ["Milk"],
    },
    {
      id: "inv-rice",
      name: "Cooked rice",
      category: "Prepared food",
      quantity: 110,
      unit: "portions",
      expiresAt: hoursFromNow(1.8),
      storageZone: "Dispatch Holding",
      temperature: 8.8,
      risk: 78,
      freshness: 52,
      status: "at_risk",
      servings: 110,
      batch: "CR-8421",
      allergens: [],
    },
    {
      id: "inv-pulao",
      name: "Vegetable pulao",
      category: "Prepared food",
      quantity: 80,
      unit: "portions",
      expiresAt: hoursFromNow(5.2),
      storageZone: "Cold Storage A",
      temperature: 4.1,
      risk: 18,
      freshness: 89,
      status: "safe",
      servings: 80,
      batch: "VP-1190",
      allergens: [],
    },
    {
      id: "inv-dough",
      name: "Fresh chapati dough",
      category: "Grain",
      quantity: 18,
      unit: "kg",
      expiresAt: hoursFromNow(8),
      storageZone: "Cold Storage A",
      temperature: 3.9,
      risk: 12,
      freshness: 94,
      status: "safe",
      servings: 150,
      batch: "CD-1004",
      allergens: ["Gluten"],
    },
    {
      id: "inv-yogurt",
      name: "Yogurt cups",
      category: "Dairy",
      quantity: 72,
      unit: "units",
      expiresAt: hoursFromNow(26),
      storageZone: "Cold Storage B",
      temperature: 4.8,
      risk: 28,
      freshness: 86,
      status: "monitor",
      servings: 72,
      batch: "YG-5672",
      allergens: ["Milk"],
    },
    {
      id: "inv-tomato",
      name: "Tomato gravy base",
      category: "Prepared food",
      quantity: 12,
      unit: "litres",
      expiresAt: hoursFromNow(0.8),
      storageZone: "Dispatch Holding",
      temperature: 9.2,
      risk: 91,
      freshness: 38,
      status: "critical",
      servings: 48,
      batch: "TG-7738",
      allergens: [],
    },
  ] as InventoryItem[],
  zones: [
    { id: "zone-a", name: "Cold Storage A", temperature: 4.1, humidity: 58, status: "normal", history: [3.8, 4.1, 4.0, 4.2, 4.1, 4.1] },
    { id: "zone-b", name: "Cold Storage B", temperature: 6.2, humidity: 64, status: "warning", history: [5.4, 5.7, 5.9, 6.0, 6.2, 6.2] },
    { id: "zone-c", name: "Dry Storage", temperature: 23.4, humidity: 46, status: "normal", history: [23.0, 23.1, 23.2, 23.5, 23.4, 23.4] },
    { id: "zone-d", name: "Dispatch Holding", temperature: 8.8, humidity: 71, status: "critical", history: [6.4, 6.9, 7.3, 7.9, 8.4, 8.8] },
  ] as StorageZone[],
  surplus: [
    {
      id: "surplus-pulao",
      foodName: "Vegetable pulao",
      servings: 80,
      preparedAt: hoursFromNow(-1.8),
      bestBefore: hoursFromNow(5.2),
      status: "available",
      dietaryTags: ["Vegetarian", "No egg"],
      qualityStatus: "safe",
      location: "Central University Kitchen",
      valueInr: 6400,
      progress: 28,
    },
    {
      id: "surplus-dal",
      foodName: "Dal & rice meal boxes",
      servings: 120,
      preparedAt: hoursFromNow(-2.2),
      bestBefore: hoursFromNow(3.1),
      status: "matching",
      dietaryTags: ["Vegetarian", "High protein"],
      qualityStatus: "safe",
      location: "Central University Kitchen",
      valueInr: 9600,
      progress: 46,
    },
    {
      id: "surplus-chapati",
      foodName: "Fresh chapatis",
      servings: 150,
      preparedAt: hoursFromNow(-0.7),
      bestBefore: hoursFromNow(8.8),
      status: "pickup_scheduled",
      dietaryTags: ["Vegetarian"],
      qualityStatus: "safe",
      location: "GreenPlate Catering Unit",
      valueInr: 4500,
      progress: 72,
    },
    {
      id: "surplus-sandwich",
      foodName: "Packaged sandwiches",
      servings: 45,
      preparedAt: hoursFromNow(-5.4),
      bestBefore: hoursFromNow(-1),
      status: "delivered",
      dietaryTags: ["Vegetarian"],
      qualityStatus: "safe",
      location: "Central University Kitchen",
      valueInr: 3600,
      progress: 100,
    },
  ] as SurplusBatch[],
  partners: [
    { id: "partner-akshaya", name: "Akshaya Community Kitchen", type: "Community kitchen", distanceKm: 4.2, capacity: 100, reliability: 96, verified: true, tags: ["Vegetarian", "Same-day pickup"] },
    { id: "partner-rescue", name: "Bengaluru Food Rescue Network", type: "Food bank", distanceKm: 6.8, capacity: 180, reliability: 91, verified: true, tags: ["All categories", "Route pooling"] },
    { id: "partner-hope", name: "Hope Shelter Bengaluru", type: "Shelter", distanceKm: 8.1, capacity: 75, reliability: 88, verified: true, tags: ["Ready meals", "Evening pickup"] },
    { id: "partner-worker", name: "Local Worker Support Centre", type: "Community kitchen", distanceKm: 10.4, capacity: 220, reliability: 84, verified: false, tags: ["Bulk portions"] },
  ],
  matches: [
    { id: "match-1", partnerId: "partner-akshaya", partnerName: "Akshaya Community Kitchen", score: 96, distanceKm: 4.2, pickupMinutes: 38, reason: "Best fit: vegetarian meals, 100-portion capacity, and a verified pickup team available within 45 minutes.", status: "suggested" },
    { id: "match-2", partnerId: "partner-rescue", partnerName: "Bengaluru Food Rescue Network", score: 91, distanceKm: 6.8, pickupMinutes: 52, reason: "High capacity and route pooling make this the strongest backup if more portions become available.", status: "suggested" },
    { id: "match-3", partnerId: "partner-hope", partnerName: "Hope Shelter Bengaluru", score: 83, distanceKm: 8.1, pickupMinutes: 64, reason: "Good dietary fit with evening service, but the pickup window is less urgent for this batch.", status: "suggested" },
  ] as Match[],
  routes: [
    {
      id: "route-1",
      title: "Central Kitchen → Akshaya Community Kitchen",
      status: "in_transit",
      distanceKm: 4.2,
      durationMinutes: 38,
      emissionsKg: 1.1,
      stops: [
        { name: "Central University Kitchen", type: "Pickup", eta: "10:18 AM" },
        { name: "Akshaya Community Kitchen", type: "Delivery", eta: "10:56 AM" },
      ],
    },
  ] as Route[],
  alerts: [
    { id: "alert-expiry", title: "Tomato gravy base needs action", description: "12 litres reach their safe window in under 60 minutes. Redistribute or discard after quality confirmation.", severity: "critical", status: "unread", createdAt: "8 min ago", relatedId: "inv-tomato" },
    { id: "alert-temp", title: "Dispatch Holding is above target", description: "Temperature is 8.8°C, 2.8°C above the recommended maximum for prepared meals.", severity: "warning", status: "unread", createdAt: "16 min ago", relatedId: "zone-d" },
    { id: "alert-forecast", title: "Tomorrow's lunch forecast changed", description: "Demand is down 12% versus Monday. Reduce the production plan by 48 portions.", severity: "info", status: "read", createdAt: "32 min ago", relatedId: "fc-lunch" },
  ] as Alert[],
  activity: [
    { id: "act-1", title: "Delivery completed", description: "45 packaged sandwiches reached Hope Shelter Bengaluru.", time: "Today, 9:42 AM", type: "delivery" },
    { id: "act-2", title: "New surplus detected", description: "80 portions of vegetable pulao are available for redistribution.", time: "Today, 9:16 AM", type: "surplus" },
    { id: "act-3", title: "Forecast refreshed", description: "Lunch demand adjusted to 420 meals with 92% confidence.", time: "Today, 8:48 AM", type: "forecast" },
    { id: "act-4", title: "Storage zone flagged", description: "Dispatch Holding crossed the prepared-food temperature threshold.", time: "Today, 8:32 AM", type: "alert" },
  ] as ActivityEvent[],
  deliveryCompleted: false,
});

let state = makeInitialState();

const addActivity = (title: string, description: string, type: string) => {
  state.activity.unshift({
    id: `act-${Date.now()}`,
    title,
    description,
    time: "Just now",
    type,
  });
  state.activity = state.activity.slice(0, 10);
};

const computeOverview = () => {
  const activeSurplus = state.surplus
    .filter((item) => !["delivered", "expired", "cancelled"].includes(item.status))
    .reduce((sum, item) => sum + item.servings, 0);
  const deliveredMeals = state.surplus
    .filter((item) => item.status === "delivered")
    .reduce((sum, item) => sum + item.servings, 0);
  const criticalItems = state.inventory.filter((item) => item.risk >= 70).length;
  const routeCount = state.routes.filter((route) => route.status !== "delivered").length;
  return {
    metrics: {
      plannedMeals: 1240,
      forecastMeals: 1180,
      activeSurplus,
      wasteAvoidedKg: 1860 + Math.round(deliveredMeals * 0.08),
      mealsRedistributed: 4120 + deliveredMeals,
      carbonSavedKg: 1854 + Math.round(deliveredMeals * 0.45),
      waterSavedLitres: 288400 + deliveredMeals * 70,
      moneySavedInr: 158100 + deliveredMeals * 85,
      criticalItems,
      activeRoutes: routeCount,
    },
    recommendations: [
      { id: "rec-1", title: "Reduce tomorrow's lunch plan", description: "Attendance and weather signals point to a softer lunch service.", impact: "48 portions avoided", priority: "High", actionLabel: "Review forecast" },
      { id: "rec-2", title: "Redistribute vegetable pulao", description: "A verified community kitchen can collect this batch in 38 minutes.", impact: "80 meals saved", priority: "High", actionLabel: "Open surplus" },
      { id: "rec-3", title: "Move dispatch meals to Cold Storage A", description: "Dispatch Holding is trending above the safe temperature range.", impact: "Protects 158 portions", priority: "Medium", actionLabel: "View storage" },
    ],
    alerts: state.alerts.filter((alert) => alert.status !== "resolved").slice(0, 3),
    trends: [0, 1, 2, 3, 4, 5, 6].map((offset) => ({
      label: dateLabel(-6 + offset),
      planned: [1190, 1240, 1210, 1260, 1290, 1250, 1240][offset],
      actual: [1142, 1174, 1190, 1204, 1228, 1210, 1180][offset],
      waste: [88, 74, 63, 71, 52, 48, 42][offset],
    })),
  };
};

const router: IRouter = Router();

router.get("/overview", (_req, res) => res.json(computeOverview()));

router.get("/forecasts", (req, res) => {
  const parsed = GetForecastsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid forecast filters" });
  return res.json(state.forecasts);
});

router.post("/forecasts", (req, res) => {
  const parsed = GenerateForecastBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Forecast date and attendance are required" });
  const predictedMeals = Math.round(parsed.data.attendance * 0.84);
  const forecast: Forecast = {
    id: `fc-${Date.now()}`,
    forecastDate: parsed.data.forecastDate,
    mealType: "Lunch",
    predictedMeals,
    recommendedProduction: Math.round(predictedMeals * 1.05),
    lowerBound: Math.round(predictedMeals * 0.92),
    upperBound: Math.round(predictedMeals * 1.08),
    confidence: 89,
    explanation: `The revised plan uses ${parsed.data.attendance} expected attendees, a Tuesday pattern, and a weather adjustment.`,
  };
  state.forecasts = [forecast, ...state.forecasts.filter((item) => item.mealType !== "Lunch")];
  addActivity("Forecast refreshed", `Lunch demand revised to ${predictedMeals} meals.`, "forecast");
  return res.status(201).json(forecast);
});

router.get("/inventory", (req, res) => {
  const parsed = GetInventoryQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid inventory filters" });
  const search = parsed.data.search?.toLowerCase();
  const filtered = state.inventory.filter((item) => {
    const matchesRisk = !parsed.data.risk || item.status === parsed.data.risk;
    const matchesSearch = !search || item.name.toLowerCase().includes(search);
    return matchesRisk && matchesSearch;
  });
  return res.json(filtered);
});

router.post("/inventory", (req, res) => {
  const parsed = CreateInventoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Inventory name, quantity, unit, and expiry are required" });
  const item: InventoryItem = {
    id: `inv-${Date.now()}`,
    name: parsed.data.name,
    category: "Prepared food",
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
    expiresAt: parsed.data.expiresAt,
    storageZone: "Cold Storage A",
    temperature: 4.2,
    risk: 15,
    freshness: 92,
    status: "safe",
    servings: parsed.data.quantity,
    batch: `NEW-${Date.now().toString().slice(-4)}`,
    allergens: [],
  };
  state.inventory.unshift(item);
  addActivity("Inventory item added", `${item.name} was added to Cold Storage A.`, "inventory");
  return res.status(201).json(item);
});

router.patch("/inventory/:id", (req, res) => {
  const params = UpdateInventoryParams.safeParse(req.params);
  const body = UpdateInventoryBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid inventory update" });
  const item = state.inventory.find((entry) => entry.id === params.data.id);
  if (!item) return res.status(404).json({ error: "Inventory item not found" });
  Object.assign(item, body.data);
  if (body.data.temperature !== undefined) {
    item.risk = Math.min(99, Math.max(item.risk, Math.round(20 + Math.max(0, body.data.temperature - 4) * 10)));
    item.freshness = Math.max(20, 100 - item.risk);
  }
  addActivity("Inventory updated", `${item.name} status is now ${item.status}.`, "inventory");
  return res.json(item);
});

router.post("/inventory/:id/quality-scan", (req, res) => {
  const params = req.params.id;
  const item = state.inventory.find((entry) => entry.id === params);
  if (!item) return res.status(404).json({ error: "Inventory item not found" });
  const risk = Math.min(99, item.risk + 3);
  return res.json({
    freshness: Math.max(0, 100 - risk),
    risk,
    indicators: risk > 70 ? ["Surface moisture", "Expiry proximity", "Temperature deviation"] : ["Color within expected range", "Packaging intact", "No visible spoilage indicators"],
    recommendation: risk > 70 ? "Prioritize redistribution or quality review immediately." : "Safe to hold in the current storage zone and monitor.",
  });
});

router.get("/storage-zones", (_req, res) => res.json(state.zones));

router.post("/storage-zones/:id/simulate", (req, res) => {
  const zone = state.zones.find((entry) => entry.id === req.params.id);
  if (!zone) return res.status(404).json({ error: "Storage zone not found" });
  zone.temperature = Number((zone.temperature + 1.8).toFixed(1));
  zone.history = [...zone.history.slice(-5), zone.temperature];
  zone.status = zone.temperature > 8 ? "critical" : zone.temperature > 5 ? "warning" : "normal";
  const related = state.inventory.filter((item) => item.storageZone === zone.name);
  related.forEach((item) => {
    item.temperature = zone.temperature;
    item.risk = Math.min(99, item.risk + 12);
    item.freshness = Math.max(20, 100 - item.risk);
    item.status = item.risk > 80 ? "critical" : item.risk > 55 ? "at_risk" : "monitor";
  });
  if (zone.status === "critical") {
    state.alerts.unshift({
      id: `alert-${Date.now()}`,
      title: `${zone.name} crossed the safe range`,
      description: `Simulated sensor reading is now ${zone.temperature}°C. Move prepared meals to a safer zone.`,
      severity: "critical",
      status: "unread",
      createdAt: "Just now",
      relatedId: zone.id,
    });
  }
  addActivity("Sensor update simulated", `${zone.name} is now ${zone.temperature}°C.`, "alert");
  return res.json(zone);
});

router.get("/surplus", (req, res) => {
  const parsed = GetSurplusQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid surplus filters" });
  return res.json(parsed.data.status ? state.surplus.filter((item) => item.status === parsed.data.status) : state.surplus);
});

router.post("/surplus", (req, res) => {
  const parsed = CreateSurplusBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Food name, servings, and best-before time are required" });
  const surplus: SurplusBatch = {
    id: `surplus-${Date.now()}`,
    foodName: parsed.data.foodName,
    servings: parsed.data.servings,
    preparedAt: new Date().toISOString(),
    bestBefore: parsed.data.bestBefore,
    status: "available",
    dietaryTags: parsed.data.dietaryTags ?? ["Vegetarian"],
    qualityStatus: "safe",
    location: "Central University Kitchen",
    valueInr: parsed.data.servings * 80,
    progress: 12,
  };
  state.surplus.unshift(surplus);
  addActivity("New surplus listed", `${surplus.servings} portions of ${surplus.foodName} are ready for matching.`, "surplus");
  return res.status(201).json(surplus);
});

router.patch("/surplus/:id", (req, res) => {
  const params = UpdateSurplusParams.safeParse(req.params);
  const body = UpdateSurplusBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid surplus update" });
  const surplus = state.surplus.find((entry) => entry.id === params.data.id);
  if (!surplus) return res.status(404).json({ error: "Surplus batch not found" });
  if (body.data.status) {
    surplus.status = body.data.status;
    surplus.progress = body.data.status === "delivered" ? 100 : body.data.status === "pickup_scheduled" ? 72 : surplus.progress;
  }
  addActivity("Surplus status updated", `${surplus.foodName} is now ${surplus.status.replaceAll("_", " ")}.`, "surplus");
  return res.json(surplus);
});

router.get("/surplus/:id/matches", (req, res) => {
  const surplus = state.surplus.find((entry) => entry.id === req.params.id);
  if (!surplus) return res.status(404).json({ error: "Surplus batch not found" });
  return res.json(state.matches);
});

router.post("/surplus/:id/matches/:matchId/accept", (req, res) => {
  const params = AcceptSurplusMatchParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid match" });
  const match = state.matches.find((entry) => entry.id === params.data.matchId);
  const surplus = state.surplus.find((entry) => entry.id === params.data.id);
  if (!match || !surplus) return res.status(404).json({ error: "Match or surplus batch not found" });
  match.status = "accepted";
  surplus.status = "pickup_scheduled";
  surplus.progress = 72;
  addActivity("Partner match accepted", `${match.partnerName} will collect ${surplus.servings} portions of ${surplus.foodName}.`, "partner");
  return res.json(match);
});

router.get("/partners", (_req, res) =>
  res.json(state.partners),
);

router.get("/routes", (_req, res) => res.json(state.routes));

router.post("/routes", (req, res) => {
  const parsed = OptimizeRouteBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Surplus and partner are required" });
  const surplus = state.surplus.find((entry) => entry.id === parsed.data.surplusId);
  const partner = state.partners.find((entry) => entry.id === parsed.data.partnerId);
  if (!surplus || !partner) return res.status(404).json({ error: "Surplus or partner not found" });
  const route: Route = {
    id: `route-${Date.now()}`,
    title: `Central Kitchen → ${partner.name}`,
    status: "planned",
    distanceKm: partner.distanceKm,
    durationMinutes: Math.round(partner.distanceKm * 8.5),
    emissionsKg: Number((partner.distanceKm * 0.26).toFixed(1)),
    stops: [
      { name: surplus.location, type: "Pickup", eta: "10:18 AM" },
      { name: partner.name, type: "Delivery", eta: "10:56 AM" },
    ],
  };
  state.routes.unshift(route);
  surplus.status = "pickup_scheduled";
  surplus.progress = 72;
  addActivity("Route optimized", `${route.distanceKm} km route planned to ${partner.name}.`, "route");
  return res.status(201).json(route);
});

router.get("/sustainability", (_req, res) => {
  const delivered = state.surplus.filter((item) => item.status === "delivered").reduce((sum, item) => sum + item.servings, 0);
  const base = 4120 + delivered;
  return res.json({
    mealsRedistributed: base,
    wasteAvoidedKg: 1860 + Math.round(base * 0.08),
    carbonSavedKg: 1854 + Math.round(base * 0.45),
    waterSavedLitres: 288400 + base * 70,
    moneySavedInr: 158100 + base * 85,
    successRate: state.deliveryCompleted ? 91 : 87,
    daily: [0, 1, 2, 3, 4, 5, 6].map((offset) => ({
      label: dateLabel(-6 + offset),
      meals: [480, 610, 520, 690, 740, 640, 520][offset],
      carbon: [216, 274, 234, 310, 333, 288, 234][offset],
      waste: [122, 98, 104, 86, 72, 65, 58][offset],
    })),
  });
});

router.get("/alerts", (_req, res) => res.json(state.alerts));

router.patch("/alerts/:id", (req, res) => {
  const params = UpdateAlertParams.safeParse(req.params);
  const body = UpdateAlertBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid alert update" });
  const alert = state.alerts.find((entry) => entry.id === params.data.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.status = body.data.status;
  addActivity("Alert updated", `${alert.title} marked ${alert.status}.`, "alert");
  return res.json(alert);
});

router.get("/activity", (_req, res) => res.json(state.activity));

router.post("/demo/reset", (_req, res) => {
  state = makeInitialState();
  return res.json({ message: "Demo data reset to the starting state." });
});

router.post("/demo/simulate", (req, res) => {
  const parsed = SimulateDemoBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Unknown demo action" });
  switch (parsed.data.action) {
    case "temperature_spike":
      state.zones[3].temperature = 9.6;
      state.zones[3].status = "critical";
      state.zones[3].history = [...state.zones[3].history.slice(-5), 9.6];
      addActivity("Temperature spike simulated", "Dispatch Holding is now at 9.6°C.", "alert");
      return res.json({ message: "Dispatch Holding temperature spike simulated." });
    case "new_surplus":
      state.surplus.unshift({
        id: `surplus-${Date.now()}`,
        foodName: "Lemon rice bowls",
        servings: 60,
        preparedAt: new Date().toISOString(),
        bestBefore: hoursFromNow(4),
        status: "available",
        dietaryTags: ["Vegetarian", "No dairy"],
        qualityStatus: "safe",
        location: "Central University Kitchen",
        valueInr: 4800,
        progress: 12,
      });
      addActivity("New surplus detected", "60 lemon rice bowls are ready for redistribution.", "surplus");
      return res.json({ message: "New lemon rice surplus added." });
    case "accept_match":
      state.matches[0].status = "accepted";
      state.surplus[0].status = "pickup_scheduled";
      state.surplus[0].progress = 72;
      addActivity("Partner match accepted", "Akshaya Community Kitchen accepted the top match.", "partner");
      return res.json({ message: "Top partner match accepted." });
    case "complete_delivery":
      state.deliveryCompleted = true;
      state.surplus[0].status = "delivered";
      state.surplus[0].progress = 100;
      state.routes[0].status = "delivered";
      addActivity("Delivery completed", "The demo route was delivered successfully.", "delivery");
      return res.json({ message: "Demo delivery completed." });
    case "advance_time":
      addActivity("Simulation advanced", "The demo clock moved forward by one hour.", "system");
      return res.json({ message: "Demo time advanced by one hour." });
  }
});

export default router;
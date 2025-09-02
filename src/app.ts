import express, { Request, Response, Express } from "express";

/**
 * Interface representing a customer.
 */
interface Customer {
    id: number;
    name: string;
    status: "GOLD" | "SILVER" | "BRONZE";
    points: number;
    lastPurchaseDate: string;
    email?: string;
    preferredStore?: string;
    joinDate: string;
    notifications: boolean;
    lastStatusChange?: string;
}

const customers: Customer[] = [
    {
        id: 1,
        name: "John Smith",
        status: "SILVER",
        points: 450,
        lastPurchaseDate: "2024-02-15",
        joinDate: "2023-06-15",
        notifications: true,
        preferredStore: "Downtown",
    },
    {
        id: 2,
        name: "Jane Doe",
        status: "GOLD",
        points: 850,
        lastPurchaseDate: "2024-03-01",
        email: "jane.doe@email.com",
        joinDate: "2023-01-20",
        notifications: false,
    },
];

const app: Express = express();
app.use(express.json());

/**
 * Retrieve a customer by ID.
 */
app.get("/api/customers/:id", (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.id);
    const customer: Customer | undefined = customers.find(
        (c) => c.id === customerId
    );
    if (customer) {
        res.json(customer);
    } else {
        res.status(404).send("Customer not found");
    }
});

/**
 * Record a purchase for a customer and update status based on points.
 */
app.post("/api/customers/:id/purchase", (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.id);
    const customer: Customer | undefined = customers.find(
        (c) => c.id === customerId
    );
    if (!customer) {
        res.status(404).send("Customer not found");
        return;
    }

    const purchaseAmount: number = req.body.amount;
    const storeLocation: string = req.body.storeLocation;

    customer.points += Math.floor(purchaseAmount / 10);
    customer.lastPurchaseDate = new Date().toISOString();

    if (customer.points >= 750) {
        customer.status = "GOLD";
        customer.lastStatusChange = new Date().toISOString();
    } else if (customer.points >= 500) {
        customer.status = "SILVER";
        customer.lastStatusChange = new Date().toISOString();
    }

    res.json(customer);
});

/**
 * Update customer preferences, such as notifications, preferred store, and email.
 */
app.patch("/api/customers/:id/preferences", (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.id);
    const customer: Customer | undefined = customers.find(
        (c) => c.id === customerId
    );
    if (!customer) {
        res.status(404).send("Customer not found");
        return;
    }

    if (typeof req.body.notifications === "boolean") {
        customer.notifications = req.body.notifications;
    }
    if (typeof req.body.preferredStore === "string") {
        customer.preferredStore = req.body.preferredStore;
    }
    if (typeof req.body.email === "string") {
        customer.email = req.body.email;
    }

    res.json(customer);
});

/**
 * Ticket #6: Get loyalty program analytics.
 */
app.get("/api/analytics", (req: Request, res: Response): void => {
    const stats = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        totalPoints: 0,
        totalCustomers: customers.length,
    };

    for (const c of customers) {
        stats.totalPoints += c.points;
        if (c.status === "BRONZE") stats.bronze++;
        else if (c.status === "SILVER") stats.silver++;
        else if (c.status === "GOLD") stats.gold++;
        else if (c.status === "PLATINUM") stats.platinum++;
    }

    res.json(stats);
});

export default app;

// Admin page components
export { default as Dashboard } from "./Dashboard";
export { default as MerchantRequests } from "./MerchantRequests";
export { default as Orders } from "./Orders";
export { default as Users } from "./Users";
export { default as Roles } from "./Roles";
export { default as Stores } from "./Stores";
export { default as Products } from "./Products";
export { default as Offers } from "./AdminOffers";
export { default as Subscriptions } from "./Subscriptions";
export { default as CreateAdmins } from "./CreateAdmins";

// Placeholder components - will be implemented later
export const Cities = () => <div className="p-6"><h1 className="text-2xl font-bold">المدن والمواقع</h1><p className="text-muted-foreground mt-2">قريباً...</p></div>;
export const Payments = () => <div className="p-6"><h1 className="text-2xl font-bold">الاشتراكات والمدفوعات</h1><p className="text-muted-foreground mt-2">قريباً...</p></div>;
export const Reports = () => <div className="p-6"><h1 className="text-2xl font-bold">التقارير</h1><p className="text-muted-foreground mt-2">قريباً...</p></div>;
export const Logs = () => <div className="p-6"><h1 className="text-2xl font-bold">السجلات</h1><p className="text-muted-foreground mt-2">قريباً...</p></div>;
export const AdminSettings = () => <div className="p-6"><h1 className="text-2xl font-bold">الإعدادات</h1><p className="text-muted-foreground mt-2">قريباً...</p></div>;

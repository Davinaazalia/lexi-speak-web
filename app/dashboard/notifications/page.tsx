"use client";

const notifications = [
  { id: 1, title: "Role change request", detail: "A user asked to switch from student to coach.", time: "5m ago" },
  { id: 2, title: "New student joined", detail: "A new student account was created.", time: "18m ago" },
  { id: 3, title: "Profile updated", detail: "A coach updated profile details.", time: "1h ago" },
];

export default function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Notifications</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">System updates and account activity.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((item) => (
            <li key={item.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-[min(420px,calc(100vw-40px))] rounded-lg border border-sky-200 bg-white px-4 py-3 font-bold text-sky-900 shadow-xl shadow-sky-900/10 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-100">
      {message}
    </div>
  );
}

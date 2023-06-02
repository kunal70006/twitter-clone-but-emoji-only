import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren<unknown>) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="no-scrollbar h-full w-full overflow-y-auto border-x border-slate-600 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};

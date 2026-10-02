import { useEffect, useRef } from "react";

export function InstitutionalRemotePage() {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    import("institutional/mount").then(({ mountInstitutional }) => {
      if (active && targetRef.current) {
        mountInstitutional(targetRef.current);
      }
    });

    return () => {
      active = false;
      targetRef.current?.replaceChildren();
    };
  }, []);

  return <div ref={targetRef} className="institutional-remote" />;
}

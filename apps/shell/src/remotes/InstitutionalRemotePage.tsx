import { Alert, Button } from "@niar/ui";
import { useEffect, useRef, useState } from "react";
import { RemoteLoading } from "../components/RemoteLoading/RemoteLoading";
import "./InstitutionalRemotePage.css";

export function InstitutionalRemotePage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setHasError(false);

    import("institutional/mount")
      .then(({ mountInstitutional }) => {
        if (!active || !targetRef.current) return;

        mountInstitutional(targetRef.current);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;

        setIsLoading(false);
        setHasError(true);
      });

    return () => {
      active = false;
      targetRef.current?.replaceChildren();
    };
  }, []);

  if (hasError) {
    return (
      <main className="institutional-remote-error">
        <div className="institutional-remote-error__content">
          <Alert severity="error">
            Não foi possível carregar o site institucional. Tente novamente em alguns instantes.
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      {isLoading && <RemoteLoading label="site institucional" />}
      <div ref={targetRef} className="institutional-remote" aria-hidden={isLoading} />
    </>
  );
}

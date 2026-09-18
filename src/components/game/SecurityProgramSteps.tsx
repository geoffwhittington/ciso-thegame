export function SecurityProgramSteps({ threatModel, requirements, controls }: {
  threatModel: boolean;
  requirements: boolean;
  controls: boolean;
}) {
  const stepClass = (complete: boolean, current: boolean) =>
    complete
      ? 'bg-emerald-100 border-emerald-500'
      : current
        ? 'bg-yellow-100 border-yellow-500'
        : 'bg-muted/30 border-foreground/15';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
      <div className={`rounded-lg border-2 px-2 py-1.5 ${stepClass(threatModel, !threatModel)}`}>
        <strong>1. Find risks</strong>
        <div>Threat Modeling</div>
      </div>
      <div className={`rounded-lg border-2 px-2 py-1.5 ${stepClass(requirements, threatModel && !requirements)}`}>
        <strong>2. Tell teams how</strong>
        <div>Security Requirements</div>
      </div>
      <div className={`rounded-lg border-2 px-2 py-1.5 ${stepClass(controls && requirements, requirements && !controls)}`}>
        <strong>3. Apply controls</strong>
        <div>Tools configured for each risk</div>
      </div>
    </div>
  );
}

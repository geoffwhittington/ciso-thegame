import { ReportRow } from './ReportRow';

function eventMark(outcome?: string, effect?: string) {
  const o = (outcome || '').toLowerCase();
  if (o.includes('fail') || o.includes('slow')) return '❌';
  if (o.includes('pass') || o.includes('patched')) return '✅';
  if (effect === 'budget_cut' || effect === 'cost_increase') return '❌';
  if (effect === 'valuation_risk') return '⚠️';
  return '✅';
}

export function ReportInternal({
  trust,
  fixes,
  milestones,
  products,
  degradations,
  events,
}: {
  trust: { data: { text: string } }[];
  fixes: { data: { count: number; items: string[] } }[];
  milestones: { data: { name: string; valuationBoost?: number } }[];
  products: { type: string; data: { name: string; id?: string; securityAllowanceK?: number } }[];
  degradations: { data: { defense: string; text: string } }[];
  events: { data: { name: string; outcome?: string; effect?: string } }[];
}) {
  return (
    <ul className="space-y-2">
      {trust.map((e, i) => (
        <ReportRow key={`t${i}`} mark="✅" title="Quiet quarter">
          {e.data.text.replace(/^Quiet quarter\.\s*/, '')}
        </ReportRow>
      ))}
      {fixes.map((e, i) => (
        <ReportRow key={`f${i}`} mark="✅" title={`Staff closed ${e.data.count} listed gap${e.data.count !== 1 ? 's' : ''}`}>
          {e.data.items.join('; ')}
        </ReportRow>
      ))}
      {milestones.map((e, i) => (
        <ReportRow key={`m${i}`} mark="✅" title={e.data.name}>
          {e.data.valuationBoost ? `${e.data.valuationBoost}% valuation` : undefined}
        </ReportRow>
      ))}
      {products.map((e, i) => (
        <ReportRow
          key={`p${i}`}
          mark="📦"
          title={e.data.name}
        >
          {e.type === 'product_arrived'
            ? `Entered the pipeline.${
                e.data.securityAllowanceK != null
                  ? ` Board added $${e.data.securityAllowanceK}K ${
                      e.data.id === 'acq' ? 'acquisition integration' : 'launch readiness'
                    } funding.`
                  : ''
              }`
            : 'Entered production'}
        </ReportRow>
      ))}
      {degradations.map((e, i) => (
        <ReportRow key={`d${i}`} mark="❌" title={`${e.data.defense}: operational setback`}>
          {e.data.text} Ran one level weaker this quarter.
        </ReportRow>
      ))}
      {events.map((e, i) => (
        <ReportRow key={`e${i}`} mark={eventMark(e.data.outcome, e.data.effect)} title={e.data.name}>
          {e.data.outcome}
        </ReportRow>
      ))}
    </ul>
  );
}

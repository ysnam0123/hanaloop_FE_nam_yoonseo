import { Activity, DuplicateGroup } from '@/types/activities';
import TotalEmissionCard from './TotalEmissionCard';
import DuplicateCard from './DuplicateCard';

interface Props {
  data: Activity[];
  onDuplicateClick: (group: DuplicateGroup) => void;
}

function getDuplicateGroups(data: Activity[]): DuplicateGroup[] {
  const keys: string[] = [];
  const groups: Activity[][] = [];

  for (let i = 0; i < data.length; i++) {
    const a = data[i];
    if (!a.is_duplicate) continue;
    const key = a.date + '__' + a.site + '__' + a.type + '__' + a.description;
    const idx = keys.indexOf(key);
    if (idx === -1) {
      keys.push(key);
      groups.push([a]);
    } else {
      groups[idx].push(a);
    }
  }

  const result: DuplicateGroup[] = [];
  for (let i = 0; i < groups.length; i++) {
    const items = groups[i];
    result.push({
      date: items[0].date,
      site: items[0].site,
      type: items[0].type,
      description: items[0].description,
      items,
    });
  }
  return result;
}

export default function BottomStats({ data, onDuplicateClick }: Props) {
  const total = data.reduce((sum, a) => sum + a.emission, 0);
  const dupGroups = getDuplicateGroups(data);

  const monthList: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i].date.slice(0, 7);
    if (monthList.indexOf(m) === -1) monthList.push(m);
  }

  return (
    <div className="grid grid-cols-2 gap-4 shrink-0">
      <TotalEmissionCard
        total={total}
        count={data.length}
        months={monthList.length}
      />
      <DuplicateCard groups={dupGroups} onView={onDuplicateClick} />
    </div>
  );
}

import { getItemName } from '../data/itemNames.js';

export default function ItemTimeline({ items }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">装备时间线</h4>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <span className="text-gray-400 text-sm w-12 shrink-0">{item.time}</span>
            <div className="flex-1 h-8 bg-gray-800 rounded flex items-center px-2">
              <span className="text-white text-sm">{getItemName(item.itemId)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

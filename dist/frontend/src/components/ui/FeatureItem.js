"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureItem = FeatureItem;
const react_1 = require("react");
function FeatureItem({ title, description, icon }) {
    return (<div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {icon && (<div className="flex-shrink-0 w-8 h-8 text-blue-600">
          {icon}
        </div>)}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>);
}
//# sourceMappingURL=FeatureItem.js.map
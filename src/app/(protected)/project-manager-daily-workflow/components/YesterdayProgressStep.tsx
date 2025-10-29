import React, { useState } from "react";
import ItemForm from "./ItemForm";

interface YesterdayProgressStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const YesterdayProgressStep: React.FC<YesterdayProgressStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const [itemIndex, setItemIndex] = useState(0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Yesterday&apos;s Progress
        </h2>
        <p className="text-text-secondary mb-4">
          Record yesterday&apos;s work progress for each project item
        </p>
      </div>

      {/* Current Item Details */}
      <ItemForm
        itemIndex={itemIndex}
        setItemIndex={setItemIndex}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  );
};

export default YesterdayProgressStep;

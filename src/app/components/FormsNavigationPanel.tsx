"use client";

import React from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormItemData {
  formId: string; // The stable UUID
  label: string; // e.g. form.task or "No Task"
}

interface FormItemProps {
  item: FormItemData;
  active: boolean;
  onClick: () => void;
}

const FormItem: React.FC<FormItemProps> = ({ item, active, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.formId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <button
        type="button"
        onClick={onClick}
        {...attributes}
        {...listeners}
        className={`w-full text-left font-medium px-3 py-2 rounded transition-colors ${
          active
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
      >
        {item.label}
      </button>
    </li>
  );
};

interface FormsNavigationPanelProps {
  forms: FormItemData[];
  activeFormId: string; // The currently active form
  onDragEnd: (event: DragEndEvent, newItems: FormItemData[]) => void;
  onFormClick: (formId: string) => void;
}

const FormsNavigationPanel: React.FC<FormsNavigationPanelProps> = ({
  forms,
  activeFormId,
  onDragEnd,
  onFormClick,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;
    const oldIndex = forms.findIndex((f) => f.formId === event.active.id);
    const newIndex = forms.findIndex((f) => f.formId === event.over!.id);
    if (oldIndex === newIndex) return;
    const newArr = arrayMove(forms, oldIndex, newIndex);
    onDragEnd(event, newArr);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={forms.map((f) => f.formId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="sticky top-95 bg-white shadow-lg rounded-lg p-4 space-y-4 mt-4">
          <h4 className="text-md font-bold text-gray-900">Forms</h4>
          <ul className="space-y-2">
            {forms.map((item) => (
              <FormItem
                key={item.formId}
                item={item}
                active={item.formId === activeFormId}
                onClick={() => onFormClick(item.formId)}
              />
            ))}
          </ul>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default FormsNavigationPanel;

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

interface GroupItemProps {
  groupId: string;
  active: boolean;
  onClick: () => void;
}

const GroupItem: React.FC<GroupItemProps> = ({ groupId, active, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: groupId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <button
        onClick={onClick}
        {...attributes}
        {...listeners}
        className={`w-full text-left font-medium px-3 py-2 rounded transition-colors ${
          active ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
      >
        <span className="font-bold text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {groupId}
        </span>
      </button>
    </li>
  );
};

interface GroupsNavigationPanelProps {
  groups: string[];          // ordered list of group IDs
  activeGroup: string;       // which group is "selected"
  onGroupClick: (gid: string) => void;
  onDragEnd: (result: DragEndEvent, newGroups: string[]) => void;
}

const GroupsNavigationPanel: React.FC<GroupsNavigationPanelProps> = ({
  groups,
  activeGroup,
  onGroupClick,
  onDragEnd,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    const oldIndex = groups.findIndex((g) => g === e.active.id);
    const newIndex = groups.findIndex((g) => g === e.over!.id);
    if (oldIndex === newIndex) return;
    const newGroups = arrayMove(groups, oldIndex, newIndex);
    onDragEnd(e, newGroups);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={groups} strategy={verticalListSortingStrategy}>
        <div className="sticky top-4 bg-white shadow-lg rounded-lg p-6 space-y-4">
          <h4 className="text-md font-bold text-gray-900">Groups</h4>
          <ul className="space-y-2">
            {groups.map((gid) => (
              <GroupItem
                key={gid}
                groupId={gid}
                active={activeGroup === gid}
                onClick={() => onGroupClick(gid)}
              />
            ))}
          </ul>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default GroupsNavigationPanel;

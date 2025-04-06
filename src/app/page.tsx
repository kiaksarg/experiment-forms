"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  createRef,
  useCallback,
} from "react";
import { DragEndEvent } from "@dnd-kit/core";

import { xPageData } from "@/forms/PageData";
import { XFormData } from "@/forms/formData";
import XForm, { XFormSubmitData } from "./components/XForm";

import GroupsNavigationPanel from "./components/GroupsNavigationPanel";
import FormsNavigationPanel from "./components/FormsNavigationPanel";

export default function Home() {
  const [participantName, setParticipantName] = useState(
    xPageData.participantName || ""
  );
  const [overallComment, setOverallComment] = useState(xPageData.comment || "");
  // Each form has: { id: string (UUID), groupId: string, fields: [...], task: ...}
  const [allForms] = useState<XFormData[]>(xPageData.forms);

  // 1) The user’s chosen group order
  const [orderedGroups, setOrderedGroups] = useState(() => {
    const uniqueGroups = Array.from(
      new Set(allForms.map((f) => f.groupId ?? "default"))
    );
    return uniqueGroups;
  });

  // 2) For each group, store the order of forms
  const [groupFormsOrder, setGroupFormsOrder] = useState<{
    [groupId: string]: string[];
  }>(() => {
    const initial: { [gid: string]: string[] } = {};
    orderedGroups.forEach((gid) => {
      const key = gid ?? "default"; // Use "default" if gid is undefined
      const formsOfGroup = allForms.filter(
        (f) => (f.groupId ?? "default") === key
      );
      initial[gid] = formsOfGroup
        .map((f) => f.id)
        .filter((id): id is string => id !== undefined);
    });
    return initial;
  });

  // The user selects which group is "active"
  const [activeGroup, setActiveGroup] = useState(orderedGroups[0] || "");

  // The user selects which form is "active" within the active group
  const [activeFormId, setActiveFormId] = useState("");

  // Aggregated responses for each form in final flatten order
  const [formResponses, setFormResponses] = useState<{
    [index: number]: XFormSubmitData;
  }>({});

  // Build the final display order by flattening groups
  const allFormsInDisplayOrder = useMemo(() => {
    const result: XFormData[] = [];
    orderedGroups.forEach((gid) => {
      const formIds = groupFormsOrder[gid] || [];
      formIds.forEach((fid) => {
        const form = allForms.find((f) => f.id === fid);
        if (form) result.push(form);
      });
    });
    return result;
  }, [orderedGroups, groupFormsOrder, allForms]);

  // Intersection Observers
  // 1) Each group container in the center column
  const groupContainerRefs = useMemo(() => {
    return orderedGroups.map(() => createRef<HTMLDivElement>());
  }, [orderedGroups]);

  // 2) Each form container in the center column
  const formContainerRefs = useMemo(() => {
    return allFormsInDisplayOrder.map(() => createRef<HTMLDivElement>());
  }, [allFormsInDisplayOrder]);

  /**
   * Return the forms (in order) for the active group
   */
  const getActiveGroupForms = useMemo(() => {
    const formIds = groupFormsOrder[activeGroup] || [];
    return formIds
      .map((id) => {
        const frm = allForms.find((x) => x.id === id);
        return frm ? { formId: frm.id, label: frm.task || "No Task" } : null;
      })
      .filter((x): x is { formId: string; label: string } => !!x);
  }, [activeGroup, groupFormsOrder, allForms]);

  // DRAG HANDLERS
  // Groups reorder
  const handleGroupDragEnd = (event: DragEndEvent, newGroups: string[]) => {
    setOrderedGroups(newGroups);
  };
  // Forms reorder within the active group
  const handleFormsDragEnd = (
    event: DragEndEvent,
    newItems: { formId: string; label: string }[]
  ) => {
    setGroupFormsOrder((prev) => ({
      ...prev,
      [activeGroup]: newItems.map((x) => x.formId),
    }));
  };

  // CLICK HANDLERS
  const handleGroupClick = (groupId: string) => {
    setActiveGroup(groupId);
    // Optionally scroll to that group's container
    const gIndex = orderedGroups.indexOf(groupId);
    groupContainerRefs[gIndex].current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleFormClick = (formId: string) => {
    setActiveFormId(formId);
    // Optionally scroll to that form in the center
    const index = allFormsInDisplayOrder.findIndex((f) => f.id === formId);
    if (index >= 0) {
      formContainerRefs[index].current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Building XForm callbacks
  const formCallbacks = useMemo(() => {
    return allFormsInDisplayOrder.map((_, index) => ({
      onSubmit: (data: XFormSubmitData) => handleFormChange(index, data),
      onChange: (data: XFormSubmitData) => handleFormChange(index, data),
    }));
  }, [allFormsInDisplayOrder]);

  const handleFormChange = useCallback(
    (absoluteIndex: number, data: XFormSubmitData) => {
      setFormResponses((prev) => ({ ...prev, [absoluteIndex]: data }));
    },
    []
  );

  // Intersection Observer for groups
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const gIndex = Number(
              entry.target.getAttribute("data-group-index")
            );
            setActiveGroup(orderedGroups[gIndex]);
          }
        });
      },
      { threshold: 0.3 }
    );

    groupContainerRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.setAttribute("data-group-index", idx.toString());
        obs.observe(ref.current);
      }
    });
    return () => obs.disconnect();
  }, [groupContainerRefs, orderedGroups]);

  // Intersection Observer for forms
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fIndex = Number(entry.target.getAttribute("data-form-index"));
            const formObj = allFormsInDisplayOrder[fIndex];
            if (formObj && formObj.id !== undefined)
              setActiveFormId(formObj.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    formContainerRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.setAttribute("data-form-index", idx.toString());
        obs.observe(ref.current);
      }
    });
    return () => obs.disconnect();
  }, [formContainerRefs, allFormsInDisplayOrder]);

  // Basic resets and downloads
  const handleGlobalReset = () => {
    if (window.confirm("Are you sure you want to reset all forms?")) {
      setParticipantName(xPageData.participantName || "");
      setOverallComment(xPageData.comment || "");
      setFormResponses({});
    }
  };
  const downloadAggregatedJSON = () => {
    const formsInOrder = allFormsInDisplayOrder.map((f, idx) => {
      const resp = formResponses[idx]?.responses || {};
      return { groupId: f.groupId, task: f.task, responses: resp };
    });
    const data = {
      participantName,
      overallComment,
      forms: formsInOrder,
    };
    const str = JSON.stringify(data, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aggregated_responses.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAggregatedCSV = () => {
    const csvRows = [
      "participantName,overallComment,formTitle,task,questionId,selected,comment",
    ];
    allFormsInDisplayOrder.forEach((form, index) => {
      const responses =
        formResponses[index]?.responses ||
        form.fields.reduce((acc, field) => {
          acc[field.id] = { selected: null, comment: "" };
          return acc;
        }, {} as { [key: string]: { selected: string | null; comment: string } });
      Object.entries(responses).forEach(([questionId, response]) => {
        const selected =
          response.selected && response.selected !== ""
            ? response.selected
            : "null";
        const comment =
          response.comment && response.comment !== ""
            ? `"${response.comment.replace(/"/g, '""')}"`
            : "";
        csvRows.push(
          `"${participantName}","${overallComment}","${form.title}","${
            form.task || ""
          }",${questionId},${selected},${comment}`
        );
      });
    });
    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aggregated_responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* LEFT COL: Groups nav + Forms nav for the active group */}
        <div className="md:col-span-1 space-y-4">
          <GroupsNavigationPanel
            groups={orderedGroups}
            activeGroup={activeGroup}
            onGroupClick={handleGroupClick}
            onDragEnd={handleGroupDragEnd}
          />
          <FormsNavigationPanel
            forms={getActiveGroupForms}
            activeFormId={activeFormId}
            onDragEnd={handleFormsDragEnd}
            onFormClick={handleFormClick}
          />
        </div>

        {/* MIDDLE COL: Center display of all groups, each group's forms in local order */}
        <div className="md:col-span-3 space-y-8">
          {orderedGroups.map((gid, gIndex) => {
            const formIds = groupFormsOrder[gid] || [];
            return (
              <div
                key={gid}
                ref={groupContainerRefs[gIndex]}
                className="bg-white shadow-lg rounded-lg p-8"
              >
                <h2 className="text-xl font-bold mb-4">{`Group: ${gid}`}</h2>
                {formIds.map((fid) => {
                  const formObj = allForms.find((ff) => ff.id === fid);
                  if (!formObj) return null;
                  const absoluteIndex = allFormsInDisplayOrder.indexOf(formObj);
                  return (
                    <div
                      key={fid}
                      ref={formContainerRefs[absoluteIndex]}
                      className="mb-6"
                    >
                      <XForm
                        data={formObj}
                        onSubmit={formCallbacks[absoluteIndex].onSubmit}
                        onChange={formCallbacks[absoluteIndex].onChange}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* RIGHT COL: Participant details + Download/Reset */}
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-8">
            {/* Participant info */}
            <div className="bg-white shadow-lg rounded-lg p-8">
              <label
                className="block text-lg font-bold text-black mb-2"
                htmlFor="participantName"
              >
                Participant Name
              </label>
              <input
                id="participantName"
                type="text"
                className="w-full p-2 border border-gray-300 rounded text-lg text-black mb-4"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
              />
              <label
                className="block text-lg font-bold text-black mb-2"
                htmlFor="overallComment"
              >
                Overall Comment
              </label>
              <textarea
                id="overallComment"
                className="w-full p-2 border border-gray-300 rounded text-black"
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
              />
            </div>

            {/* Download, reset, etc */}
            <div className="bg-white shadow-lg rounded-lg p-8">
              <button
                onClick={downloadAggregatedJSON}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full"
              >
                Download JSON
              </button>
              <button
                onClick={downloadAggregatedCSV}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full mt-4"
              >
                Download CSV
              </button>
              <button
                onClick={handleGlobalReset}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full mt-4"
              >
                Reset All Forms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

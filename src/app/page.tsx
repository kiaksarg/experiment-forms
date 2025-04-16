"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  createRef,
  useCallback,
  useRef,
} from "react";
import { DragEndEvent } from "@dnd-kit/core";

import { xPageData } from "@/forms/PageData";
import { XFormData } from "@/forms/formData";
import XForm, { XFormSubmitData } from "./components/XForm";

import GroupsNavigationPanel from "./components/GroupsNavigationPanel";
import FormsNavigationPanel from "./components/FormsNavigationPanel";

const ACTIVE_STATE_KEY = "experiment_form_active_state";
const SAVED_STATES_KEY = "experiment_form_saved_states";

// Define a type for a saved state
type SavedState = {
  id: string;
  participantName: string;
  overallComment: string;
  formResponses: { [index: number]: XFormSubmitData };
  timestamp: number;
};

export default function Home() {
  const [participantName, setParticipantName] = useState(
    xPageData.participantName || ""
  );
  const [overallComment, setOverallComment] = useState(xPageData.comment || "");
  // Each form has: { id: string, groupId: string, fields: [...], task: ... }
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
      const key = gid ?? "default";
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

  // This version is used to force a re-mount of XForm components when loading a saved state
  const [formVersion, setFormVersion] = useState(Date.now());

  // The active state for this session.
  // On a fresh page load, we do NOT load an active state automatically.
  // It will be created only when a non‑empty participant name is entered.
  const [activeState, setActiveState] = useState<SavedState | null>(null);

  // The list of manually saved states
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);

  // On mount, load the saved states list only.
  useEffect(() => {
    const storedSaved = localStorage.getItem(SAVED_STATES_KEY);
    if (storedSaved) {
      setSavedStates(JSON.parse(storedSaved));
    }
  }, []);

  // Create a new active state when participantName becomes non-empty and no active state exists.
  useEffect(() => {
    if (!activeState && participantName.trim() !== "") {
      const newState: SavedState = {
        id: `${participantName}-${Date.now()}`,
        participantName,
        overallComment,
        formResponses,
        timestamp: Date.now(),
      };
      setActiveState(newState);
      localStorage.setItem(ACTIVE_STATE_KEY, JSON.stringify(newState));
    }
  }, [participantName, overallComment, formResponses, activeState]);

  // Auto-save: update the active state on every change (debounced) and update the saved states list.
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      if (activeState) {
        const updated: SavedState = {
          ...activeState,
          participantName,
          overallComment,
          formResponses,
          timestamp: Date.now(),
        };
        setActiveState(updated);
        localStorage.setItem(ACTIVE_STATE_KEY, JSON.stringify(updated));
        // Also update the saved states list automatically.
        const currentSaved: SavedState[] = JSON.parse(
          localStorage.getItem(SAVED_STATES_KEY) || "[]"
        );
        const idx = currentSaved.findIndex((s) => s.id === updated.id);
        if (idx !== -1) {
          currentSaved[idx] = updated;
        } else {
          currentSaved.push(updated);
        }
        localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(currentSaved));
        setSavedStates(currentSaved);
      }
    }, 500);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [participantName, overallComment, formResponses, activeState]);

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
  const groupContainerRefs = useMemo(() => {
    return orderedGroups.map(() => createRef<HTMLDivElement>());
  }, [orderedGroups]);

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
  const handleGroupDragEnd = (event: DragEndEvent, newGroups: string[]) => {
    setOrderedGroups(newGroups);
  };

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
    const gIndex = orderedGroups.indexOf(groupId);
    groupContainerRefs[gIndex].current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormClick = (formId: string) => {
    setActiveFormId(formId);
    const localIndex = activeGroupFormsInOrder.findIndex(
      (f) => f.id === formId
    );
    console.log("Scrolling to local index:", localIndex, formId);
    if (localIndex >= 0 && activeFormContainerRefs[localIndex]?.current) {
      activeFormContainerRefs[localIndex].current.scrollIntoView({
        behavior: "smooth",
      });
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

  // Intersection Observers for groups and forms

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
    // Get current date and time and format it for the filename (e.g., 2025-04-08T14-30-00-000Z)
    const dateTimeStr = new Date().toISOString().replace(/[:.]/g, "-");
    // Set the filename using participantName and dateTimeStr
    a.download = `${participantName.replace(
      " ",
      "_"
    )}_${dateTimeStr}_aggregated_responses.json`;
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
    const dateTimeStr = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `${participantName.replace(
      " ",
      "_"
    )}_${dateTimeStr}_aggregated_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Manual Save remains as a fallback if desired.
  const handleManualSaveState = () => {
    if (!activeState) return;
    const currentSaved: SavedState[] = JSON.parse(
      localStorage.getItem(SAVED_STATES_KEY) || "[]"
    );
    const idx = currentSaved.findIndex((s) => s.id === activeState.id);
    if (idx !== -1) {
      currentSaved[idx] = activeState;
    } else {
      currentSaved.push(activeState);
    }
    localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(currentSaved));
    setSavedStates(currentSaved);
  };

  // Delete a saved state with confirmation.
  const handleDeleteState = (stateId: string) => {
    if (window.confirm("Are you sure delete this state?")) {
      const currentSaved: SavedState[] = JSON.parse(
        localStorage.getItem(SAVED_STATES_KEY) || "[]"
      );
      const updated = currentSaved.filter((s) => s.id !== stateId);
      localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(updated));
      setSavedStates(updated);
    }
  };

  // Load state: Update inputs immediately and force re-mount of forms.
  const handleLoadState = (state: SavedState) => {
    setParticipantName(state.participantName);
    setOverallComment(state.overallComment);
    setFormResponses(state.formResponses);
    setActiveState(state);
    localStorage.setItem(ACTIVE_STATE_KEY, JSON.stringify(state));
    setFormVersion(Date.now());
  };

  // When activeGroup changes, set the first form in that group as active and scroll to it.
  useEffect(() => {
    const groupFormIds = groupFormsOrder[activeGroup] || [];
    if (groupFormIds.length > 0) {
      const firstFormId = groupFormIds[0];
      setActiveFormId(firstFormId);
      const index = allFormsInDisplayOrder.findIndex(
        (f) => f.id === firstFormId
      );
      if (index >= 0 && formContainerRefs[index].current) {
        formContainerRefs[index].current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [activeGroup, groupFormsOrder, allFormsInDisplayOrder, formContainerRefs]);

  const activeGroupFormsInOrder = useMemo(() => {
    return (groupFormsOrder[activeGroup] || [])
      .map((fid) => allForms.find((f) => f.id === fid))
      .filter(Boolean) as XFormData[];
  }, [activeGroup, groupFormsOrder, allForms]);

  const activeFormContainerRefs = useMemo(() => {
    return activeGroupFormsInOrder.map(() => createRef<HTMLDivElement>());
  }, [activeGroupFormsInOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const localIndex = Number(
              entry.target.getAttribute("data-form-index")
            );
            const formObj = activeGroupFormsInOrder[localIndex];
            if (formObj && formObj.id) {
              setActiveFormId(formObj.id);
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px" }
    );

    activeFormContainerRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.setAttribute("data-form-index", idx.toString());
        observer.observe(ref.current);
      }
    });
    return () => observer.disconnect();
  }, [activeFormContainerRefs, activeGroupFormsInOrder]);

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-360 mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
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

        {/* MIDDLE COL: Center display of only the active group */}
        <div className="md:col-span-3">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4 text-gray-500">{`Group: ${activeGroup}`}</h2>
            {activeGroupFormsInOrder.map((formObj, localIndex) => {
              return (
                <div
                  key={formObj.id}
                  ref={activeFormContainerRefs[localIndex]}
                  data-form-index={localIndex}
                  className="mb-6"
                >
                  <XForm
                    key={`${formObj.id}-${formVersion}`}
                    data={formObj}
                    initialData={
                      formResponses[
                        allForms.findIndex((f) => f.id === formObj.id)
                      ]
                    }
                    onSubmit={
                      formCallbacks[
                        allForms.findIndex((f) => f.id === formObj.id)
                      ].onSubmit
                    }
                    onChange={
                      formCallbacks[
                        allForms.findIndex((f) => f.id === formObj.id)
                      ].onChange
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COL: Participant details + Active State Info + Saved States + Download/Reset */}
        <div className="md:col-span-1 space-y-4 md:sticky md:top-0 md:max-h-screen md:overflow-y-auto pr-4">
          {/* Participant info */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <label
              className="block text-md font-bold text-black mb-2"
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
              className="block text-md font-bold text-black mb-2"
              htmlFor="overallComment"
            >
              Comment
            </label>
            <textarea
              id="overallComment"
              className="w-full p-2 border border-gray-300 rounded text-black"
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
            />
          </div>
          {/* Download & Reset */}
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

          {/* Active State Info */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h3 className="text-md font-bold mb-2 text-black">Active State</h3>
            {activeState ? (
              <p className="text-black text-sm">
                {activeState.participantName} – {activeState.id}
              </p>
            ) : (
              <p className="text-gray-600">No active state.</p>
            )}
            <button
              onClick={handleManualSaveState}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Save State Now
            </button>
          </div>

          {/* Saved States List */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h3 className="text-md font-bold mb-2 text-black">Saved States</h3>
            <div className="text-black h-40 overflow-y-scroll">
              {savedStates.length === 0 ? (
                <p className="text-gray-600">No saved states found.</p>
              ) : (
                <ul className="space-y-2">
                  {savedStates.map((state) => (
                    <li
                      key={state.id}
                      className="flex justify-between items-center border-b border-gray-300 py-1"
                    >
                      <div className="text-sm">
                        {state.participantName} –{" "}
                        {new Date(state.timestamp).toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadState(state)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteState(state.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

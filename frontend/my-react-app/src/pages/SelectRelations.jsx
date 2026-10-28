import React, { useEffect, useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import "./SelectRelations.css";
import UserManual from "./UserManual";

const RELATIONS = [
  "after",
  "along with",
  "although",
  "and",
  "as a result",
  "as well as",
  "because",
  "because of",
  "before",
  "besides",
  "but",
  "despite",
  "due to",
  "even though",
  "for example",
  "however",
  "if",
  "if then",
  "in addition",
  "in other words",
  "not only..but also",
  "or",
  "otherwise",
  "that's why",
  "then",
  "thus",
];

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/`

export default function SelectRelations({
  task = null,
  level = "easy",
  taskId = 1,
  onBack = null,
}) {
  // Add to your existing state declarations
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectedSentences, setSelectedSentences] = useState([]);
  const [relation, setRelation] = useState("and");
  const [combinedSentences, setCombinedSentences] = useState([]);
  const [combinedResult, setCombinedResult] = useState("—");
  const [finalSteps, setFinalSteps] = useState([]);
  const [finalStructure, setFinalStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [userOrders, setUserOrders] = useState({});
  const [combinedRelations, setCombinedRelations] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "",
    visible: false,
  });
  const [showUserManual, setShowUserManual] = useState(false);
  const messageIdRef = useRef(0);
  const evaluationDisplayedRef = useRef(false);
  const finalSectionRef = useRef(null);
  const sentenceRefs = useRef([]);
  const [inFinalSentences, setInFinalSentences] = useState(new Set()); // Track which sentences are in final
  const [inFinalCombinedSentences, setInFinalCombinedSentences] = useState(
    new Set(),
  ); // Track which combined sentences are in final

  // ADD MANUAL HANDLERS
  const handleShowManual = () => {
    setShowUserManual(true);
  };

  const handleCloseManual = () => {
    setShowUserManual(false);
  };

  // Compact utility functions
  const normalizeSentence = (s) => (s ? s.trim().replace(/\.$/, "") : "");
  const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : "");
  const upperFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  // Show temporary message
  const showMessage = (text, type = "info") => {
    const messageId = ++messageIdRef.current;
    setMessage({ text: "", type: "", visible: false });

    setTimeout(() => {
      setMessage({ text, type, visible: true });
      setTimeout(() => {
        setMessage((prev) =>
          messageId === messageIdRef.current
            ? { ...prev, visible: false }
            : prev,
        );
      }, 3003);
    }, 50);
  };

  // // Fetch sentences
  // useEffect(() => {
  //   const loadInstructions = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");
  //       const mongoTaskId = `${level}_${taskId}`;
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/select-relations/${level}/${taskId}`,
  //       );  
       
  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data.sentences?.length) {
  //           const sentencesList = data.sentences.map((item, index) => ({
  //             text: item.text,
  //             sentence_id: item.sentence_id || `sent_${index + 1}`,
  //             step_number: item.step_number || index + 1,
  //             letter: item.letter || "",
  //             level: item.level || level,
  //             task_id: item.task_id || mongoTaskId,
  //           }));
  //           setInstructions(sentencesList);
  //           showMessage(`Loaded ${sentencesList.length} sentences`, "success");
  //         } else throw new Error("Invalid format");
  //       } else throw new Error(`Server error: ${response.status}`);
  //     } catch (err) {
  //       console.error("❌ Error:", err);
  //       setInstructions([
  //         {
  //           text: "The student studied hard for the exam.",
  //           sentence_id: "sent_1",
  //         },
  //         {
  //           text: "She completed all her assignments on time.",
  //           sentence_id: "sent_2",
  //         },
  //         {
  //           text: "He understood the complex concepts.",
  //           sentence_id: "sent_3",
  //         },
  //         { text: "They passed with flying colors.", sentence_id: "sent_4" },
  //         { text: "The teacher was very proud.", sentence_id: "sent_5" },
  //       ]);
  //       showMessage("Using mock data", "warning");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadInstructions();
  // }, [level, taskId]);

  useEffect(() => {
  const loadInstructions = async () => {
    try {
      setLoading(true);
      setError("");
      
      // DEBUG: Log what we're trying to fetch
      console.log("🔍 FETCHING: ", `${API_BASE_URL}/api/select-relations/${level}/${taskId}`);
      console.log("🔍 Level:", level, "TaskId:", taskId);
      
      const response = await fetch(
        `${API_BASE_URL}/api/select-relations/${level}/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("🔍 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Response data:", data);
        
        if (data.sentences?.length) {
          const sentencesList = data.sentences.map((item, index) => ({
            text: item.text,
            sentence_id: item.sentence_id || `sent_${index + 1}`,
            step_number: item.step_number || index + 1,
            letter: item.letter || "",
            level: item.level || level,
            task_id: item.task_id || `${level}_${taskId}`,
          }));
          setInstructions(sentencesList);
          showMessage(`Loaded ${sentencesList.length} sentences`, "success");
        } else {
          console.error("❌ Invalid format - no sentences array:", data);
          setError("Invalid data format from server");
          setInstructions([]);
        }
      } else {
        console.error("❌ Server error:", response.status, response.statusText);
        // Try to get error response body
        try {
          const errorData = await response.json();
          console.error("❌ Error details:", errorData);
          setError(`Server error: ${errorData.error || response.statusText}`);
        } catch (e) {
          setError(`Server error: ${response.status} - ${response.statusText}`);
        }
        setInstructions([]);
      }
    } catch (err) {
      console.error("❌ Error in loadInstructions:", err);
      
      // Log the full error object
      console.error("❌ Full error:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // REMOVED MOCK DATA - Now show error state
      setError(`Failed to load: ${err.message}`);
      setInstructions([]);
      
    } finally {
      setLoading(false);
    }
  };
  loadInstructions();
}, [level, taskId]);

  const allSteps = useMemo(
    () => [
      ...instructions.map((inst) => ({
        text: inst.text,
        sentence_id: inst.sentence_id,
        isCombined: false,
        letter: inst.letter,
        step_number: inst.step_number,
      })),
      ...combinedSentences.map((c) => ({
        text: c.text,
        sentence_ids: c.sentence_ids,
        isCombined: true,
        relation: c.relation,
        original_sentences: c.original_sentences,
      })),
    ],
    [instructions, combinedSentences],
  );

  // Helper function to check if a step is in final text
  const isStepInFinal = (step) => {
    if (step.isCombined) {
      const combinedId = step.sentence_ids?.sort().join("_") || "";
      return inFinalCombinedSentences.has(combinedId);
    } else {
      return inFinalSentences.has(step.sentence_id);
    }
  };

  useEffect(() => {
    setSelectedSentences(selectedIndices.map((index) => allSteps[index]));
  }, [selectedIndices, allSteps]);

  // const toggleSelect = (index) => {
  //   const step = allSteps[index];

  //   if (!step.isCombined && usedSentenceIds.has(step.sentence_id)) {
  //     showMessage("This sentence is already used in a combination", "warning");
  //     return;
  //   }

  //   if (step.isCombined) {
  //     showMessage("Combined sentences cannot be selected", "warning");
  //     return;
  //   }

  //   setSelectedIndices((prev) => {
  //     if (prev.includes(index)) return prev.filter((i) => i !== index);
  //     if (prev.length >= 2) {
  //       showMessage("Select maximum 2 sentences", "warning");
  //       return prev;
  //     }
  //     return [...prev, index];
  //   });
  // };
  const toggleSelect = (index) => {
  const step = allSteps[index];

  // Only check for original sentences that are already used
  if (!step.isCombined && usedSentenceIds.has(step.sentence_id)) {
    showMessage("This sentence is already used in a combination", "warning");
    return;
  }

  // REMOVED the restriction on combined sentences

  setSelectedIndices((prev) => {
    if (prev.includes(index)) return prev.filter((i) => i !== index);
    if (prev.length >= 2) {
      showMessage("Select maximum 2 sentences", "warning");
      return prev;
    }
    return [...prev, index];
  });
};

  const removeSelected = (indexToRemove) => {
    setSelectedIndices((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove),
    );
  };

  const jumpToSentence = (index) => {
    if (sentenceRefs.current[index]) {
      sentenceRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const element = sentenceRefs.current[index];
      element.classList.add("highlight-pulse");
      setTimeout(() => element.classList.remove("highlight-pulse"), 1500);
    }
  };

  const buildCombinedSentence = (s1Raw, s2Raw, relation) => {
    const s1 = normalizeSentence(s1Raw);
    const s2 = normalizeSentence(s2Raw);
    if (!s1 || !s2) return "";

    const templates = {
      then: `${s1}, then ${lowerFirst(s2)}.`,
      and: `${s1} and ${lowerFirst(s2)}.`,
      or: `${s1} or ${lowerFirst(s2)}.`,
      but: `${s1}, but ${lowerFirst(s2)}.`,
      "as well as": `${s1}, as well as ${lowerFirst(s2)}.`,
      besides: `${s1}; besides, ${lowerFirst(s2)}.`,
      "in addition": `${s1}; in addition, ${lowerFirst(s2)}.`,
      "along with": `${s1}, along with ${lowerFirst(s2)}.`,

      "if then": `If ${lowerFirst(s1)}, then ${lowerFirst(s2)}.`,
      if: `If ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,
      otherwise: `${s1}. Otherwise, ${lowerFirst(s2)}.`,

      after: `After ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,
      before: `Before ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,

      because: `${s1} because ${lowerFirst(s2)}.`,
      "because of": `${s2} because of ${lowerFirst(s1)}.`,
      "due to": `${s2} due to ${lowerFirst(s1)}.`,

      thus: `${s1}. Thus, ${lowerFirst(s2)}.`,
      "that's why": `${s1}. That is why ${lowerFirst(s2)}.`,
      "as a result": `${s1}. As a result, ${lowerFirst(s2)}.`,

      although: `Although ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,
      "even though": `Even though ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,
      despite: `Despite ${lowerFirst(s1)}, ${lowerFirst(s2)}.`,

      "not only..but also": `Not only ${lowerFirst(s1)}, but also ${lowerFirst(s2)}.`,
      however: `${s1}. However, ${lowerFirst(s2)}.`,

      "in other words": `${s1}. In other words, ${lowerFirst(s2)}.`,
      "for example": `${s1}. For example, ${lowerFirst(s2)}.`,
    };

    return upperFirst(
      templates[relation] || `${s1} ${relation} ${lowerFirst(s2)}.`,
    );
  };

  // const handleCombine = async () => {
  //   if (selectedIndices.length !== 2) {
  //     showMessage("Select exactly two sentences", "warning");
  //     return;
  //   }

  //   const step1 = allSteps[selectedIndices[0]];
  //   const step2 = allSteps[selectedIndices[1]];

  //   // Double-check that neither step is a combined sentence
  //   if (step1.isCombined || step2.isCombined) {
  //     showMessage("Cannot combine combined sentences", "warning");
  //     return;
  //   }
  const handleCombine = async () => {
  if (selectedIndices.length !== 2) {
    showMessage("Select exactly two sentences", "warning");
    return;
  }

  const step1 = allSteps[selectedIndices[0]];
  const step2 = allSteps[selectedIndices[1]];

  // REMOVED: No longer checking if steps are combined

    const ids1 = step1.isCombined ? step1.sentence_ids : [step1.sentence_id];
    const ids2 = step2.isCombined ? step2.sentence_ids : [step2.sentence_id];

    const isSameGroup = combinedSentences.some(
      (c) =>
        ids1.every((id) => c.sentence_ids.includes(id)) &&
        ids2.every((id) => c.sentence_ids.includes(id)),
    );

    if (isSameGroup) {
      showMessage("Already combined", "warning");
      return;
    }

    const result = buildCombinedSentence(step1.text, step2.text, relation);
    if (!result) {
      showMessage("Combination failed", "error");
      return;
    }

    const newCombined = {
      text: result,
      sentence_ids: [...ids1, ...ids2],
      isCombined: true,
      relation: relation,
      original_sentences: [step1.text, step2.text],
    };

    try {
      await fetch(`${API_BASE_URL}/api/add-discourse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence1_id: ids1[0],
          sentence2_id: ids2[0],
          relation: relation,
        }),
      });
    } catch (err) {
      console.error("❌ Error:", err);
    }

    setCombinedResult(result);
    setCombinedSentences((prev) => [...prev, newCombined]);
    setSelectedIndices([]);
    setCombinedRelations((prev) => ({
      ...prev,
      [newCombined.sentence_ids.join(",")]: relation,
    }));

    showMessage("✅ Combined!", "success");
  };

  const usedSentenceIds = useMemo(() => {
    const used = new Set();
    combinedSentences.forEach((c) =>
      c.sentence_ids.forEach((id) => used.add(id)),
    );
    return used;
  }, [combinedSentences]);

  const handleAddToFinal = (step) => {
    if (step.isCombined) {
      // Generate unique ID for combined sentence
      const combinedId = step.sentence_ids.sort().join("_");

      const alreadyExists = finalStructure.some(
        (item) => item.type === "combined" && item.combinedId === combinedId,
      );

      if (alreadyExists) {
        showMessage("Already in final list", "warning");
        return;
      }

      const newItem = {
        type: "combined",
        sentences: step.sentence_ids,
        combinedId: combinedId,
        relation: step.relation,
        text: step.text,
      };

      setFinalSteps((prev) => [...prev, step.text]);
      setFinalStructure((prev) => [...prev, newItem]);

      // Add to combined sentences tracking (separate from individual sentences)
      const newCombinedSet = new Set(inFinalCombinedSentences);
      newCombinedSet.add(combinedId);
      setInFinalCombinedSentences(newCombinedSet);

      showMessage("✅ Added to final", "success");
    } else {
      const alreadyExists = finalStructure.some(
        (item) => item.type === "sentence" && item.id === step.sentence_id,
      );

      if (alreadyExists) {
        showMessage("Already in final list", "warning");
        return;
      }

      const newItem = {
        type: "sentence",
        id: step.sentence_id,
        text: step.text,
      };
      setFinalSteps((prev) => [...prev, step.text]);
      setFinalStructure((prev) => [...prev, newItem]);

      // Add to individual sentences tracking
      const newSet = new Set(inFinalSentences);
      newSet.add(step.sentence_id);
      setInFinalSentences(newSet);

      showMessage("✅ Added to final", "success");
    }

    //   setTimeout(() => {
    //     finalSectionRef.current?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "nearest",
    //     });
    //   }, 100);
  };

  const handleRemoveCombined = (idx) => {
    const removed = combinedSentences[idx];
    setCombinedSentences((prev) => prev.filter((_, i) => i !== idx));

    // Generate combined ID for lookup
    const combinedId = removed.sentence_ids.sort().join("_");

    const removedFromFinal = finalStructure.some(
      (item) => item.type === "combined" && item.combinedId === combinedId,
    );

    if (removedFromFinal) {
      setFinalSteps((prev) => prev.filter((step) => step !== removed.text));
      setFinalStructure((prev) =>
        prev.filter(
          (item) =>
            !(item.type === "combined" && item.combinedId === combinedId),
        ),
      );

      // Update combined sentences tracking
      const newCombinedSet = new Set(inFinalCombinedSentences);
      newCombinedSet.delete(combinedId);
      setInFinalCombinedSentences(newCombinedSet);
    }

    setSelectedIndices([]);
    showMessage("✅ Removed", "info");
  };

  const handleSaveAll = async () => {
    if (combinedSentences.length === 0) {
      showMessage("Nothing to save", "warning");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/submit-relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: `${level}_${taskId}`,
          level: level,
          task_number: taskId,
          combined_sentences: combinedSentences,
          final_structure: finalStructure,
        }),
      });
      showMessage("✅ Saved!", "success");
    } catch (err) {
      console.error("❌ Error:", err);
      showMessage("Saved locally", "warning");
    }
  };

  const handleGenerateRunningText = async () => {
    if (finalStructure.length === 0) {
      showMessage("Add steps first", "warning");
      return;
    }

    try {
      setGenerating(true);
      setGeneratedText("");
      setEvaluationResult(null);
      setShowEvaluation(false);
      evaluationDisplayedRef.current = false;

      const response = await fetch(
        `${API_BASE_URL}/api/generate-running-text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: `${taskId}`,
            sentence_order: finalStructure,
            ui_language: "english",
            evaluate: false,
          }),
        },
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      if (data.status === "success") {
        setGeneratedText(data.generated_text || finalSteps.join(" "));
        showMessage("✅ Generated!", "success");
      } else throw new Error(data.message || "Failed");
    } catch (err) {
      console.error("❌ Error:", err);
      setGeneratedText(finalSteps.join(" "));
      showMessage("Using combined text", "warning");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitFinalEvaluation = async () => {
    if (!generatedText.trim()) {
      showMessage("Generate text first", "warning");
      return;
    }

    try {
      setEvaluating(true);
      setEvaluationResult(null);
      setShowEvaluation(false);
      evaluationDisplayedRef.current = false;

      const response = await fetch(`${API_BASE_URL}/api/evaluate-combination`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: `${taskId}`,
          level: level,
          combined_text: generatedText,
          selected_sentences: finalStructure,
          status: "completed",
        }),
      });

      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();

      if (data.status === "success") {
        setEvaluationResult(data);
        setTimeout(() => {
          setShowEvaluation(true);
          evaluationDisplayedRef.current = true;
          const scoreMsg = `Score: ${data.overall_score}/10 - Task Completed!`;
          showMessage(
            `Score: ${data.overall_score}/10`,
            data.is_correct ? "success" : "warning",
          );
        }, 100);
      } else throw new Error(data.message || "Failed");
    } catch (err) {
      console.error("❌ Error:", err);
      showMessage(`Error: ${err.message}`, "error");
    } finally {
      setEvaluating(false);
    }
  };


  // Add this function after handleSubmitFinalEvaluation
const handleSaveGeneratedText = async () => {
  if (!generatedText.trim()) {
    showMessage("No text to save", "warning");
    return;
  }

  try {
    setSaving(true);
    
    const saveData = {
      generated_text: generatedText,
      level: level,
      task_id: `${taskId}`,
      final_structure: finalStructure,
      evaluation_result: evaluationResult || {}
    };

    const response = await fetch(`${API_BASE_URL}/api/save-generated-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveData),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.status === "success") {
      showMessage("✅ Text saved successfully!", "success");
      setSaveSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      throw new Error(data.message || "Failed to save");
    }
  } catch (err) {
    console.error("❌ Error saving text:", err);
    showMessage(`Error: ${err.message}`, "error");
  } finally {
    setSaving(false);
  }
};

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    evaluationDisplayedRef.current = false;
  };

  const handleRemoveFromFinal = (index) => {
    const itemToRemove = finalStructure[index];

    setFinalSteps((prev) => prev.filter((_, i) => i !== index));
    setFinalStructure((prev) => prev.filter((_, i) => i !== index));

    // Update tracking based on type
    if (itemToRemove.type === "sentence") {
      const newSet = new Set(inFinalSentences);
      newSet.delete(itemToRemove.id);
      setInFinalSentences(newSet);
    } else if (itemToRemove.type === "combined" && itemToRemove.combinedId) {
      const newCombinedSet = new Set(inFinalCombinedSentences);
      newCombinedSet.delete(itemToRemove.combinedId);
      setInFinalCombinedSentences(newCombinedSet);
    }

    const newOrders = { ...userOrders };
    delete newOrders[index];
    const updatedOrders = {};
    Object.keys(newOrders).forEach((key) => {
      const keyNum = parseInt(key);
      if (keyNum > index) updatedOrders[keyNum - 1] = newOrders[key];
      else updatedOrders[key] = newOrders[key];
    });
    setUserOrders(updatedOrders);
    showMessage("✅ Removed", "info");
  };

  const moveFinalStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= finalSteps.length) return;

    setFinalSteps((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });

    setFinalStructure((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });

    showMessage(`Moved ${direction === -1 ? "up" : "down"}`, "success");
  };

  const handleUserOrderChange = (index, value) => {
    setUserOrders((prev) => ({ ...prev, [index]: value }));
  };

  const handleKeepInOrder = () => {
    if (Object.keys(userOrders).length !== finalSteps.length) {
      showMessage("Enter order for all steps", "warning");
      return;
    }

    const itemsWithOrder = finalSteps.map((text, index) => ({
      originalIndex: index,
      order: parseInt(userOrders[index]) || 999,
      text: text,
      structure: finalStructure[index],
    }));

    const orderNumbers = itemsWithOrder
      .map((item) => item.order)
      .filter((o) => o !== 999);
    if (orderNumbers.length !== new Set(orderNumbers).size) {
      showMessage("Duplicate order numbers", "error");
      return;
    }

    if (orderNumbers.some((o) => o < 1 || o > finalSteps.length)) {
      showMessage(`Use numbers 1-${finalSteps.length}`, "error");
      return;
    }

    itemsWithOrder.sort((a, b) => a.order - b.order);
    setFinalSteps(itemsWithOrder.map((item) => item.text));
    setFinalStructure(itemsWithOrder.map((item) => item.structure));
    setUserOrders({});
    showMessage("✅ Reordered", "success");
  };

  const handleCopyFinal = async () => {
    const textToCopy = generatedText || finalSteps.join(" ");
    if (!textToCopy.trim()) {
      showMessage("No text to copy", "warning");
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      showMessage("✅ Copied!", "success");
    } catch {
      showMessage("Copy failed", "error");
    }
  };

  // SHOW USER MANUAL IF TOGGLED
  if (showUserManual) {
    return <UserManual onClose={handleCloseManual} />;
  }

  if (loading)
    return (
      <div className="select-relations-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="select-relations-container">
      {/* Message Banner */}
      {message.visible && (
        <div className={`message-banner ${message.type}`}>
          <span>{message.text}</span>
          <button
            className="message-close"
            onClick={() => setMessage({ text: "", type: "", visible: false })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Evaluation Overlay */}
      {showEvaluation && evaluationResult && (
        <div className="evaluation-overlay">
          <div className="evaluation-card">
            <div className="evaluation-header">
              <h3>📊 Evaluation Results</h3>
              <button className="close-btn" onClick={handleCloseEvaluation}>
                ✕
              </button>
            </div>
            <div className="evaluation-body">
              <div
                className={`score-card ${evaluationResult.is_correct ? "correct" : "incorrect"}`}
              >
                <div className="score-value">
                  {evaluationResult.is_correct
                    ? "✅ Perfect!"
                    : "📝 Needs Improvement"}
                </div>
                <div className="score-label">
                  Score: <strong>{evaluationResult.overall_score}/10</strong>
                  <span>({evaluationResult.similarity_percentage}%)</span>
                </div>
              </div>
              <div className="comparison-section">
                <div className="comparison-item">
                  <h4>Your Text:</h4>
                  <p className="user-text">{generatedText}</p>
                </div>
                <div className="comparison-item">
                  <h4>Expected:</h4>
                  <p className="correct-text">
                    {evaluationResult.reference_story || "N/A"}
                  </p>
                </div>
              </div>
              {evaluationResult.feedback?.length > 0 && (
                <div className="suggestions-section">
                  <h4>💡 Feedback:</h4>
                  <ul className="suggestions-list">
                    {evaluationResult.feedback.map((feedback, idx) => (
                      <li key={idx}>{feedback}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluationResult.is_correct && (
                <div className="success-message">
                  <div className="success-icon">🎉</div>
                  <p>Perfect match!</p>
                </div>
              )}
            </div>
            <div className="evaluation-footer">
              <button
                className="action-btn primary"
                onClick={handleCloseEvaluation}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
{/* Header */}
<header className="relations-header">
  <div className="header-top">
    {/* LEFT SIDE: Back + Title */}
    <div className="header-left-group">
      <button
        className="navigation-btn back-btn"
        onClick={onBack || (() => window.history.back())}
      >
        <span className="btn-icon">⬅</span> Back
      </button>

      <div className="header-left">
        <h1 className="main-title">
          <span className="title-icon">🔗</span>Sentence Relations
        </h1>
        <p className="subtitle">
          Select sentences → Combine with discourse → Reorder → Generate →
          Evaluate
        </p>
      </div>
    </div>

    {/* RIGHT SIDE: Help */}
    <div className="header-right-buttons">
      <button className="help-btn" onClick={handleShowManual}>
        <span className="btn-icon">❓</span> Help
      </button>
    </div>
  </div>
</header>

      {/* Main Content */}
      <div className="relations-content">
        {/* Left Panel - Sentences */}
        <div className="content-panel left-panel">
          <div className="panel-header">
            <div className="panel-title-section">
              <h2 className="panel-title">
                <span className="panel-icon">📝</span>Sentences (
                {allSteps.length})
              </h2>
              <div className="panel-status">
                <span className="status-count">{instructions.length}</span>{" "}
                original
                {combinedSentences.length > 0 && (
                  <span className="status-divider"> • </span>
                )}
                {combinedSentences.length > 0 && (
                  <span className="status-count amber">
                    {combinedSentences.length}
                  </span>
                )}
                {combinedSentences.length > 0 && <span> combined</span>}
              </div>
            </div>
            <div className="panel-badge">
              <div className="selection-counter">
                <span className="counter-label">Selected:</span>
                <span
                  className={`counter-value ${selectedIndices.length === 2 ? "ready" : ""}`}
                >
                  {selectedIndices.length}/2
                </span>
              </div>
            </div>
          </div>

          <div className="sentences-list-container">
            {/* Instruction moved here - shows when no sentences are selected */}
            {selectedIndices.length === 0 && (
              <div className="selection-hint">
                <span className="hint-icon">👉</span>
                <span className="hint-text">
                  Click sentences to select (max 2)
                </span>
              </div>
            )}

            <div className="sentences-list">
              {allSteps.length === 0 ? (
                <div className="empty-steps">
                  <div className="empty-icon">📝</div>
                  <p>No sentences</p>
                </div>
              ) : (
                allSteps.map((s, i) => {
                  const isSelected = selectedIndices.includes(i);
                  const isInFinal = isStepInFinal(s);
                  const isCombinedSentence = s.isCombined;
                  const isDisabled = usedSentenceIds.has(s.sentence_id);
                  return (
                    <div
                      key={`step-${i}-${s.sentence_id || s.sentence_ids?.join("-")}`}
                      ref={(el) => (sentenceRefs.current[i] = el)}
                      className={`sentence-item-compact ${s.isCombined ? "combined" : "original"} ${isSelected ? "selected" : ""} ${isInFinal ? "in-final" : ""} ${isDisabled ? "disabled" : ""}`}
                      onClick={() => !isDisabled && toggleSelect(i)}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={(e) =>
                        !isDisabled && e.key === "Enter" && toggleSelect(i)
                      }
                      // aria-label={`Sentence ${i + 1}: ${s.text.substring(0, 50)}... ${isDisabled ? "(Combined sentence - cannot be selected)" : ""}`}
                      aria-label={`Sentence ${i + 1}: ${s.text.substring(0, 50)}...`}
                      aria-disabled={isDisabled}
                      style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                    >
                      <div
                        className={`selection-checkbox ${isSelected ? "checked" : ""} ${isDisabled ? "disabled" : ""}`}
                      >
                        {isSelected && <span>✓</span>}
                        {isDisabled && (
                          <span className="disabled-icon">🔗</span>
                        )}
                      </div>
                      <div className="sentence-number-compact">#{i + 1}</div>
                      <div
                        className={`type-indicator-dot ${s.isCombined ? "combined" : "original"}`}
                      ></div>

                      <div className="sentence-text-compact">
                        <span className="sentence-text-content" title={s.text}>
                          {s.text}
                        </span>
                        {isDisabled && (
                          <span className="disabled-overlay-text"></span>
                        )}
                      </div>

                      <div className="quick-actions-compact">
                        {isSelected && (
                          <div className="selected-order-badge">
                            #{selectedIndices.indexOf(i) + 1}
                          </div>
                        )}

                        {/* Already in Final */}
                        {isInFinal && (
                          <div className="in-final-badge">✓ Added In Final</div>
                        )}

                        {/* ORIGINAL sentence → Add to Final */}
                        {!s.isCombined &&
                          !isInFinal &&
                          !usedSentenceIds.has(s.sentence_id) && (
                            <button
                              className="add-final-btn-compact"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToFinal(s);
                              }}
                              type="button"
                            >
                              Add to Final
                            </button>
                          )}

                        {/* ORIGINAL but used */}
                        {!s.isCombined &&
                          usedSentenceIds.has(s.sentence_id) &&
                          !isInFinal && (
                            <span className="used-badge">Used in Combined</span>
                          )}

                        {/* COMBINED sentence → Add to Final (optional UX) */}
                        {s.isCombined && !isInFinal && (
                          <button
                            className="add-final-btn-compact"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToFinal(s);
                            }}
                            type="button"
                          >
                            Add to Final
                          </button>
                        )}

                        {/* COMBINED sentence → Remove */}
                        {s.isCombined && (
                          <button
                            className="remove-combined-inline-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const indexToRemove = combinedSentences.findIndex(
                                (c) => c.text === s.text,
                              );
                              if (indexToRemove !== -1) {
                                handleRemoveCombined(indexToRemove);
                              }
                            }}
                            title="Remove combined sentence"
                            type="button"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Combine Sentences */}
        <div className="content-panel right-panel">
          <div className="panel-header">
            <div className="panel-title-section">
              <h2 className="panel-title">
                <span className="panel-icon">🛠️</span>Combine Sentences
              </h2>
              <div className="combination-status">
                {selectedIndices.length === 2 ? "Ready!" : "Select 2 sentences"}
              </div>
            </div>
            <div className="panel-badge">
              <span className="badge-count amber">
                {combinedSentences.length}
              </span>{" "}
              combined
            </div>
          </div>

          {/* Selected Sentences - FIXED: Trash icon positioned correctly */}
          <div className="selected-sentences-box">
            <div className="selected-box-header">
              <h3>Selected for Combination</h3>
              <span className="selected-count">{selectedIndices.length}/2</span>
            </div>

            {selectedIndices.length === 0 ? (
              <div className="empty-selected">
                <div className="empty-selected-icon">👆</div>
                <p>Click sentences from left panel to select</p>
              </div>
            ) : (
              <div className="selected-items-fixed">
                {/* Selected Original Sentences */}
                {selectedSentences.map((sentence, idx) => (
                  <div key={`selected-${idx}`} className="selected-item-fixed">
                    <div className="selected-order-badge-fixed">{idx + 1}</div>
                    <div className="selected-item-content">
                      <div className="selected-item-text-fixed">
                        {sentence.text}
                      </div>
                      <button
                        className="remove-selected-btn-fixed"
                        onClick={() => removeSelected(idx)}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {/* Combined Sentences Preview */}
                {combinedSentences.map((c, idx) => (
                  <div
                    key={`combined-preview-${idx}`}
                    className="selected-item-fixed combined-preview"
                  >
                    <div className="selected-order-badge-fixed">C</div>
                    <div className="selected-item-content">
                      <div className="selected-item-text-fixed">{c.text}</div>
                      <button
                        className="remove-selected-btn-fixed"
                        onClick={() => handleRemoveCombined(idx)}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Combination Controls */}
          <div className="combination-controls">
            <div className="controls-header">
              <h3>Combine Selected Sentences</h3>
              {selectedIndices.length === 2 && (
                  <div className="selected-indicator">
                    <span className="indicator-text">
                      Sentences #{selectedIndices.map((i) => i + 1).join(" & #")}
                    </span>
                  </div>
                )}
            </div>

            <div className="controls-body">
              <div className="relation-selector-section">
                <label className="selector-label" htmlFor="relation-select">
                  <span className="label-icon">🔗</span>Relation:
                </label>
                <div className="selector-wrapper">
                  <select
                    id="relation-select"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="relation-selector-dropdown"
                    aria-label="Select relation type"
                  >
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="selector-arrow">▼</div>
                </div>
              </div>

              <div className="combine-action-section">
                <button
                    type="button"
                    onClick={handleCombine}
                    className="combine-action-btn"
                    disabled={selectedIndices.length !== 2}
                    aria-label="Combine selected sentences"
                  >
                  <span className="action-icon">🔗</span>
                  <span className="action-text">
                    {selectedIndices.length === 2
                      ? "Combine Sentences"
                      : "Select 2 Sentences First"}
                  </span>
                </button>
                {selectedIndices.length === 2 && (
                <div className="combine-help">
                  <span className="help-icon">💡</span>
                  Creates a new combined sentence that can be added to your final text
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Combined Sentences List */}
          <div className="combined-sentences-list">
            <div className="list-header">
              <h3>Latest Combined Sentences ({combinedSentences.length})</h3>
              {combinedSentences.length > 0 && (
                <button
                  type="button"
                  className="save-all-btn"
                  onClick={handleSaveAll}
                  aria-label="Save all combined sentences"
                >
                  💾 Save All
                </button>
              )}
            </div>

            {combinedSentences.length === 0 ? (
              <div className="empty-combined">
                <div className="empty-illustration">
                  <div className="illustration-icon">🔗</div>
                  <div className="illustration-text">
                    No combined sentences yet
                  </div>
                </div>
                <p className="empty-guide">
                  Select two sentences and click "Combine" above
                </p>
              </div>
            ) : (
              <div className="combined-items-scroll">
                {combinedSentences.slice(-1).map((s) => {
                  const actualIndex = combinedSentences.length - 1;
                  const combinedId = s.sentence_ids.sort().join("_");
                  const isInFinal = inFinalCombinedSentences.has(combinedId);

                  return (
                    <div
                      key={`combined-${actualIndex}`}
                      className={`combined-sentence-item ${isInFinal ? "in-final" : ""}`}
                    >
                      <div className="combined-item-header">
                        <div className="item-number">#{actualIndex + 1}</div>
                        <div className="item-relation">
                          <span className="relation-icon-small">🔗</span>
                          {s.relation}
                        </div>

                        {isInFinal ? (
                          <div className="final-badge">✓ In Final</div>
                        ) : (
                          <button
                            className="add-final-btn-small"
                            onClick={() => handleAddToFinal(s)}
                            type="button"
                          >
                            Add to Final
                          </button>
                        )}
                      </div>

                      <div className="combined-item-text">{s.text}</div>

                      <div className="combined-item-footer">
                        <div className="item-source">
                          <span className="source-icon">📌</span>
                          From {s.sentence_ids.length} sentence
                          {s.sentence_ids.length > 1 ? "s" : ""}
                        </div>

                        <div className="item-actions">
                          <button
                            type="button"
                            className="remove-combined-btn"
                            onClick={() => handleRemoveCombined(actualIndex)}
                            aria-label="Remove combined sentence"
                          >
                            <span className="remove-icon">🗑️</span> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final Section - MODIFIED: Buttons moved to bottom */}
      <section className="final-section" ref={finalSectionRef}>
        {/* <div className="section-header">
          <div>
            <h2 className="section-title">Sentence Flow</h2>
<p className="section-subtitle">
  Follow the steps: Reorder → Generate → Evaluate
</p>

          </div> */}
        {/* </div> */}

        <div className="final-content">
          {/* Steps List */}
          <div className="final-steps-panel">
            <div className="list-header">
              <h3>Included Steps For Reording ({finalSteps.length})</h3>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleKeepInOrder}
                disabled={finalSteps.length === 0}
                aria-label="Apply custom order"
              >
                📋 Apply Order
              </button>
            </div>

            <div className="steps-list-final">
              {finalSteps.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📥</div>
                  <p>Add sentences using "Add to Final" button</p>
                </div>
              ) : (
                finalSteps.map((step, index) => {
                  const structureItem = finalStructure[index];
                  return (
                    <div key={`final-${index}`} className="final-step-item">
                      <div className="step-content">
                        <div className="step-order">
                          <input
                            type="number"
                            className="order-input"
                            value={userOrders[index] || ""}
                            placeholder="#"
                            min="1"
                            max={finalSteps.length}
                            onChange={(e) =>
                              handleUserOrderChange(index, e.target.value)
                            }
                            onClick={(e) => e.target.select()}
                            title="Order number"
                            aria-label={`Order for step ${index + 1}`}
                          />
                          <div className="order-number">{index + 1}</div>
                        </div>
                        <div className="step-text-final">
                          <p>{step}</p>
                          {structureItem.type === "combined" &&
                            structureItem.relation && (
                              <div className="step-relation-tag">
                                <small>
                                  <strong>{structureItem.relation}</strong>
                                </small>
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="step-actions">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => moveFinalStep(index, -1)}
                          disabled={index === 0}
                          aria-label="Move step up"
                        >
                          ⬆
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => moveFinalStep(index, 1)}
                          disabled={index === finalSteps.length - 1}
                          aria-label="Move step down"
                        >
                          ⬇
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => handleRemoveFromFinal(index)}
                          aria-label="Remove step"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="reorder-generate-box">
              <button
                className="generate-btn full-width"
                onClick={handleGenerateRunningText}
                disabled={finalStructure.length === 0 || generating}
                type="button"
              >
                {generating ? "Generating..." : "🧠 Generate Running Text"}
              </button>
            </div>
          </div>

            {/* Preview Panel */}
              <div className="preview-panel">
                <div className="preview-content">
                  <div className="text-header">
                    <h3>Running Text</h3>

                    <div className="text-header-actions">
                      {/* Updated Copy button with proper handler */}
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={handleCopyFinal}
                        disabled={!generatedText}
                        title="Copy generated text"
                      >
                        📋 Copy
                      </button>
                      
                      {/* Updated Save button with proper handler */}
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={handleSaveGeneratedText}
                        disabled={!generatedText || saving}
                        title="Save generated text"
                      >
                        {saving ? "💾 Saving..." : "💾 Save generated text"}
                      </button>
                    </div>

                    {/* Save success indicator */}
                    {saveSuccess && (
                      <div className="save-success-indicator">
                        <span className="success-icon">✅</span>
                        Saved!
                      </div>
                    )}

                    <div className="text-header-badges">
                      <span
                        className={`text-badge ${generatedText ? "success" : "info"}`}
                      >
                        {generatedText ? "Generated" : "Ready"}
                      </span>
                      {evaluationResult && (
                        <span
                          className={`score-badge ${evaluationResult.is_correct ? "correct" : "incorrect"}`}
                        >
                          {evaluationResult.overall_score}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {generating ? (
                    <div className="generating-state">
                      <div className="loading-spinner"></div>
                      <p>Generating...</p>
                    </div>
                  ) : generatedText ? (
                    <div className="generated-text">
                      <div className="text-content">{generatedText}</div>
                      {evaluationResult ? (
                        <div
                          className={`correction-hint ${evaluationResult.is_correct ? "success" : "warning"}`}
                        >
                          <small>
                            {evaluationResult.is_correct
                              ? "✅ Perfect!"
                              : `Score: ${evaluationResult.overall_score}/10`}
                          </small>
                        </div>
                      ) : (
                        <div className="correction-hint">
                          <small>📊 Click "Evaluate" to check</small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-preview">
                      <div className="empty-icon">📄</div>
                      <p>Click "Generate" to create text</p>
                      <p className="hint-text">
                        <small>Steps: {finalSteps.length}</small>
                      </p>
                    </div>
                  )}
                </div>
                {generatedText && (
                  <div className="evaluate-box">
                    <button
                      className="evaluate-btn full-width"
                      onClick={handleSubmitFinalEvaluation}
                      disabled={evaluating}
                      type="button"
                    >
                      {evaluating ? "Evaluating..." : "📊 Evaluate Text"}
                    </button>
                  </div>
                )}
              </div>
            </div>
      </section>
    </div>
  );
}

SelectRelations.propTypes = {
  task: PropTypes.object,
  level: PropTypes.string,
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBack: PropTypes.func,
};

"use client";
import React, { useState, useRef, useEffect } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { ExclamationIcon } from "@/src/icons/icons";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

interface Organization {
  organization_id: number;
  organization_eng: string;
  organization_arb: string;
  organization_code: string;
  parent_id?: number | null;
  organization_types: {
    organization_type_id: number;
    organization_type_eng: string;
    organization_type_arb: string;
  };
  children: Organization[];
}

export default function Page() {
  const { modules } = useLanguage();

  const { data: orgStructureData, isLoading, error } = useFetchAllEntity(
    "organization",
    { endpoint: "/organization/structure" }
  );

  const isRTL =
    document.documentElement.dir === "rtl" ||
    document.documentElement.lang === "ar";

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  const TreeNode: React.FC<{
    node: Organization;
    level?: number;
  }> = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.has(node.organization_id);
    const hasChildren = node.children && node.children.length > 0;
    const childrenRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState(0);

    useEffect(() => {
      if (childrenRef.current) {
        setLineHeight(childrenRef.current.offsetHeight);
      }
    }, [node.children.length, isExpanded]);

    return (
      <div className="flex flex-col mb-2">
        <div className={`flex items-center ${level === 0 ? "justify-center" : ""}`}>
          {level > 1 && <div className="w-12 h-0.5 bg-gray-400"></div>}

          <div
            className={`p-4 shadow-md rounded-lg text-base font-semibold cursor-pointer transition flex justify-between items-center ${
              isExpanded
                ? "bg-gradient-to-tl from-blue-600 to-blue-800 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            } ${
              level === 0 ? "w-auto min-w-[45%] mx-auto mt-5" : level === 1 ? "w-[45%]" : "w-[50%]"
            }`}
            onClick={() => hasChildren && toggleNode(node.organization_id)}
          >
            <div className="flex items-center gap-2">
              <span>{isRTL ? node.organization_arb : node.organization_eng}</span>
              {node.organization_code && (
                <span className="text-sm opacity-75">
                  ({node.organization_code})
                </span>
              )}
              {node.organization_types && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                  {isRTL
                    ? node.organization_types.organization_type_arb
                    : node.organization_types.organization_type_eng}
                </span>
              )}
            </div>
            {hasChildren && (
              <span
                className={`px-2 py-1 text-sm font-bold rounded ${
                  isExpanded ? "bg-white bg-opacity-20 text-white" : "bg-backdrop text-primary"
                }`}
              >
                {String(node.children.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={`flex relative ${level === 0 ? "justify-center" : ""}`}>
            {level > 0 && (
              <div
                className={`absolute w-[2px] bg-gray-400 ${
                  isRTL ? "right-[4rem]" : "left-[4rem]"
                }`}
                style={{ height: lineHeight > 0 ? `${lineHeight - 25}px` : "40px", top: 0 }}
              />
            )}
            <div
              ref={childrenRef}
              className={`flex flex-col gap-3 mt-3 ${
                level === 0 ? "w-full" : `flex-1 ${isRTL ? "mr-[4rem]" : "ml-[4rem]"}`
              }`}
            >
              {node.children.map((child) => (
                <TreeNode key={child.organization_id} node={child} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader items={modules?.organization?.items} disableAdd disableDelete disableSearch />
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <div style={{ width: 50 }} className="mx-auto mb-4">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
            <p className="text-text-secondary">Loading organization structure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orgStructureData?.data || orgStructureData.data.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader items={modules?.organization?.items} disableAdd disableDelete disableSearch />
        <div className="flex flex-col justify-center items-center p-8 gap-4">
          <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center ">
            <ExclamationIcon className="mr-2" width="14" height="14" />
            No organization structure could be built.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.organization?.items} disableAdd disableDelete disableSearch />
      <div className="py-5">
        {orgStructureData.data.map((rootNode: Organization) => (
          <TreeNode key={rootNode.organization_id} node={rootNode} level={0} />
        ))}
      </div>
    </div>
  );
}

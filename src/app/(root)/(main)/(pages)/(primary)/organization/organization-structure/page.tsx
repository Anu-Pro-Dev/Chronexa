"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { ExclamationIcon } from "@/src/icons/icons";

interface OrganizationType {
  organization_type_id: number;
  organization_type_eng: string;
  organization_type_arb: string;
  org_type_level: number;
  created_id: number;
  created_date: string;
  last_updated_id: number;
  last_updated_date: string;
}

interface Organization {
  organization_id: number;
  organization_eng: string;
  organization_code: string;
  organization_arb: string;
  parent_id?: number | null;
  organization_type_id: number;
  position_in_grid?: number | null;
  location_id?: number | null;
  created_id: number;
  created_date: string;
  last_updated_id: number;
  last_updated_date: string;
}

interface TreeNode {
  id: string;
  title: string;
  organization_code?: string;
  org_type_level: number;
  parent_id?: string;
  children: TreeNode[];
  isOrgType: boolean;
  organization_type_id?: number;
}

export default function Page() {
  const { modules } = useLanguage();

  const { data: orgTypesRes, isLoading: loadingTypes,
    error: orgTypesError } = useFetchAllEntity("organizationType", {
    searchParams: {
      limit: "1000",
    },
  });

  const { data: orgsRes, isLoading: loadingOrgs,
    error: orgsError } = useFetchAllEntity("organization", {
    searchParams: {
      limit: "1000",
    },
  });

  // Check if the current direction is RTL
  const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';

  const treeData = useMemo(() => {
    if (loadingTypes || loadingOrgs) return null;
    if (!orgTypesRes || !orgsRes) return null;

    const orgTypesData = orgTypesRes.data || orgTypesRes;
    const orgsData = orgsRes.data || orgsRes;

    if (!Array.isArray(orgTypesData) || !Array.isArray(orgsData)) return null;

    const orgTypes: OrganizationType[] = orgTypesData;
    const organizations: Organization[] = orgsData;
    const nodeMap: Record<string, TreeNode> = {};

    organizations.forEach((org) => {
      nodeMap[`org_${org.organization_id}`] = {
        id: `org_${org.organization_id}`,
        title: org.organization_eng.trim(),
        organization_code: org.organization_code,
        org_type_level: -1,
        parent_id: org.parent_id ? `org_${org.parent_id}` : undefined,
        children: [],
        isOrgType: false,
        organization_type_id: org.organization_type_id,
      };
    });

    organizations.forEach((org) => {
      const orgNode = nodeMap[`org_${org.organization_id}`];
      const orgType = orgTypes.find(t => t.organization_type_id === org.organization_type_id);
      if (orgNode && orgType) {
        orgNode.org_type_level = orgType.org_type_level;
      }
    });

    Object.values(nodeMap).forEach((node) => {
      if (node.parent_id && nodeMap[node.parent_id]) {
        nodeMap[node.parent_id].children.push(node);
      }
    });

    const roots: TreeNode[] = Object.values(nodeMap).filter(node => 
      !node.parent_id
    );

    return roots;
  }, [orgTypesRes, orgsRes, loadingTypes, loadingOrgs]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    newExpanded.has(nodeId) ? newExpanded.delete(nodeId) : newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

  const TreeNodeComponent = ({
    node,
    level = 0,
  }: {
    node: TreeNode;
    level?: number;
  }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isCenter = level === 0;
    const childrenContainerRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState<number>(0);

    useEffect(() => {
      if (childrenContainerRef.current) {
        setLineHeight(childrenContainerRef.current.offsetHeight);
      }
    }, [node.children.length, isExpanded]);

    return (
      <div className="flex flex-col mb-2">
        <div className={`flex items-center ${isCenter ? "justify-center" : ""}`}>
          {level > 1 && <div className="w-12 h-0.5 bg-gray-400"></div>}
          <div
            className={`p-4 shadow-md rounded-lg text-base font-semibold cursor-pointer transition flex justify-between items-center ${
              isExpanded
                ? "bg-gradient-to-tl from-blue-600 to-blue-800 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            } ${
              isCenter
                ? "w-auto min-w-[45%] mx-auto mt-5"
                : level === 1
                ? "w-[45%]"
                : "w-[50%]"
            }`}
            onClick={() => hasChildren && toggleNode(node.id)}
          >
            <div className="flex items-center gap-2">
              <span>{node.title}</span>
              {node.organization_code && (
                <span className="text-sm opacity-75">({node.organization_code})</span>
              )}
              {!node.isOrgType && (() => {
                const orgTypesData = orgTypesRes?.data || orgTypesRes;
                const orgType = Array.isArray(orgTypesData) ? orgTypesData.find(
                  (t: any) => t.organization_type_id === node.organization_type_id
                ) : null;
                
                if (orgType) {
                  return (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                      {orgType.organization_type_eng}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            {hasChildren && (
              <span
                className={`px-2 py-1 text-sm font-bold rounded ${
                  isExpanded
                    ? "bg-white bg-opacity-20 text-white"
                    : "bg-backdrop text-primary"
                }`}
              >
                {String(node.children.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={`flex relative ${isCenter ? "justify-center" : ""}`}>
            {level > 0 && (
              <div
                className={`absolute w-[2px] bg-gray-400 ${
                  isRTL ? 'right-[4rem]' : 'left-[4rem]'
                }`}
                style={{
                  height: node.children.some(child => expandedNodes.has(child.id))
                    ? "43px"
                    : `${lineHeight - 25}px`,
                  top: "0",
                }}
              />
            )}
            <div
              ref={childrenContainerRef}
              className={`flex flex-col gap-3 mt-3 ${
                isCenter
                  ? "w-full"
                  : level > 0
                  ? `flex-1 ${isRTL ? 'mr-[4rem]' : 'ml-[4rem]'}`
                  : "w-1/2"
              }`}
            >
              {node.children.map((child) => (
                <TreeNodeComponent
                  key={child.id}
                  node={child}
                  level={isCenter ? 1 : level + 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loadingTypes || loadingOrgs) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader
          items={modules?.organization?.items}
          disableAdd
          disableDelete
          disableSearch
        />
        <div className="flex justify-center items-center p-8">
          <div className="text-sm">Loading organization structure...</div>
        </div>
      </div>
    );
  }

  if (orgTypesError || orgsError) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader
          items={modules?.organization?.items}
          disableAdd
          disableDelete
          disableSearch
        />
        <div className="flex justify-center items-center p-8">
          <div className="text-sm text-danger">
            Error loading data: {orgTypesError?.message || orgsError?.message}
          </div>
        </div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    const orgTypesData = orgTypesRes?.data || orgTypesRes;
    const orgsData = orgsRes?.data || orgsRes;
    
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader
          items={modules?.organization?.items}
          disableAdd
          disableDelete
          disableSearch
        />
        <div className="flex flex-col justify-center items-center p-8 gap-4">
          <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center ">
            <ExclamationIcon className="mr-2" width="14" height="14"/>No organization structure could be built.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.organization?.items}
        disableAdd
        disableDelete
        disableSearch
      />
      <div className="py-5">
        {treeData.map((rootNode) => (
          <TreeNodeComponent key={rootNode.id} node={rootNode} level={0} />
        ))}
      </div>
    </div>
  );
}
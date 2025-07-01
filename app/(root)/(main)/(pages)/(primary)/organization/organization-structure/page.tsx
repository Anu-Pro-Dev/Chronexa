"use client";

import PowerHeader from "@/components/custom/power-comps/power-header";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { toast } from "react-hot-toast";

interface OrganizationType {
  organization_type_id: number;
  organization_type_eng: string;
  organization_type_arb: string;
  OrgTypeLevel: number;
  parent_id?: string;
}

interface Organization {
  organization_id: string;
  organization_eng: string;
  code: string;
  parent_id?: string;
  organization_type_id: string;
}

interface TreeNode {
  id: string;
  title: string;
  code?: string;
  orgTypeLevel: number;
  parent_id?: string;
  children: TreeNode[];
  isOrgType: boolean;
  organization_type_id?: string;
}

export default function Page() {
  const { modules } = useLanguage();

  const {
    data: orgTypesRes,
    isLoading: loadingTypes,
    error: orgTypesError,
  } = useFetchAllEntity("organizationType");
  
  const {
    data: orgsRes,
    isLoading: loadingOrgs,
    error: orgsError,
  } = useFetchAllEntity("organization");

  const treeData = useMemo(() => {
    // Early return with debug info
    if (loadingTypes || loadingOrgs) {
      return null;
    }

    if (!orgTypesRes || !orgsRes) {
      return null;
    }

    // Check different possible data structures
    const orgTypesData = orgTypesRes.data || orgTypesRes;
    const orgsData = orgsRes.data || orgsRes;

    if (!Array.isArray(orgTypesData) || !Array.isArray(orgsData)) {
      return null;
    }

    if (orgTypesData.length === 0 && orgsData.length === 0) {
      return null;
    }

    const orgTypes: OrganizationType[] = orgTypesData;
    const organizations: Organization[] = orgsData;

    // Create a map for quick lookup
    const nodeMap: Record<string, TreeNode> = {};

    // First, create nodes for all organization types
    orgTypes.forEach((orgType) => {
      nodeMap[`type_${orgType.organization_type_id}`] = {
        id: `type_${orgType.organization_type_id}`,
        title: orgType.organization_type_eng,
        orgTypeLevel: orgType.OrgTypeLevel,
        parent_id: orgType.parent_id ? `type_${orgType.parent_id}` : undefined,
        children: [],
        isOrgType: true,
      };
    });

    // Then, create nodes for all organizations
    organizations.forEach((org) => {
      nodeMap[`org_${org.organization_id}`] = {
        id: `org_${org.organization_id}`,
        title: org.organization_eng,
        code: org.code,
        orgTypeLevel: -1, // Will be determined by parent org type
        parent_id: org.parent_id ? `org_${org.parent_id}` : `type_${org.organization_type_id}`,
        children: [],
        isOrgType: false,
        organization_type_id: org.organization_type_id,
      };
    });

    // Set orgTypeLevel for organizations based on their type
    organizations.forEach((org) => {
      const orgNode = nodeMap[`org_${org.organization_id}`];
      const orgType = orgTypes.find(t => t.organization_type_id === Number(org.organization_type_id));
      if (orgNode && orgType) {
        orgNode.orgTypeLevel = orgType.OrgTypeLevel;
      }
    });

    // Build the tree structure - Skip ROOT org type, show its children directly
    const roots: TreeNode[] = [];

    // First, add all child nodes to their parents
    Object.values(nodeMap).forEach((node) => {
      if (node.parent_id) {
        const parent = nodeMap[node.parent_id];
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    // Find ROOT organization type and use its children as roots
    const rootOrgType = Object.values(nodeMap).find(node => 
      node.isOrgType && node.orgTypeLevel === 0
    );

    if (rootOrgType && rootOrgType.children.length > 0) {
      // Use children of ROOT as the actual roots
      roots.push(...rootOrgType.children);
    } else {
      // Fallback: show nodes without parents
      Object.values(nodeMap).forEach((node) => {
        if (!node.parent_id) {
          roots.push(node);
        }
      });
    }

    // Sort children by orgTypeLevel and then by title
    // const sortChildren = (node: TreeNode) => {
    //   node.children.sort((a, b) => {
    //     if (a.orgTypeLevel !== b.orgTypeLevel) {
    //       return a.orgTypeLevel - b.orgTypeLevel;
    //     }
    //     return a.title.localeCompare(b.title);
    //   });
    //   node.children.forEach(sortChildren);
    // };

    // roots.forEach(sortChildren);

    // const finalTree = roots.sort((a, b) => a.title.localeCompare(b.title));
    // console.log("Final tree data:", finalTree);
    
    return roots;
  }, [orgTypesRes, orgsRes, loadingTypes, loadingOrgs]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showOrgTree, setShowOrgTree] = useState<boolean>(true); // Default to true for testing
  
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const TreeNodeComponent = ({ 
    node, 
    level = 0 
  }: { 
    node: TreeNode; 
    level?: number; 
  }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isCenter = level === 0 && node.orgTypeLevel === 0;
    const childrenContainerRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState<number>(0);

    useEffect(() => {
      if (childrenContainerRef.current) {
        setLineHeight(childrenContainerRef.current.offsetHeight);
      }
    }, [node.children.length, isExpanded]);

    return (
      <div className="flex flex-col mb-2">
        <div className={`flex items-center ${isCenter ? 'justify-center' : ''}`}>
          {level > 1 && (
            <div className="w-12 h-0.5 bg-gray-400"></div>
          )}
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
              <span>
                {node.isOrgType && node.orgTypeLevel === 0 ? 'ROOT' : node.title}
              </span>
              {node.code && (
                <span className="text-sm opacity-75">({node.code})</span>
              )}
              {!node.isOrgType && (() => {
                // Find the org type for this organization
                const orgType = orgTypesRes?.data?.find(
                  (t: any) => String(t.organization_type_id) === String(node.organization_type_id)
                );
                // Show the type name except for ROOT
                if (orgType) {
                  return (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                      {orgType.organization_type_eng === "ROOT"
                      ? "ORG"
                      : orgType.organization_type_eng}
                    </span>
                  );
                }
                return null;
              })()}
              {/* <span className="text-xs text-gray-500">
                Level: {node.orgTypeLevel}
              </span> */}
            </div>
            {hasChildren && (
              <span
                className={`px-2 py-1 text-sm font-bold rounded ${
                  isExpanded 
                    ? "bg-white bg-opacity-20 text-white" 
                    : "bg-backdrop text-primary"
                }`}
              >
                {String(node.children.length).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={`flex relative ${isCenter ? 'justify-center' : ''}`}>
            {level > 0 && (
              <div
                className="absolute left-[4rem] w-[2px] bg-gray-400"
                style={{ 
                  // height: `${lineHeight - 25}px`,
                  height: node.children.some(child => expandedNodes.has(child.id)) ? "43px" : `${lineHeight - 25}px`,
                  top: "0"
                }}
              />
            )}
            <div 
             ref={childrenContainerRef}
              className={`flex flex-col gap-3 mt-3 ${
                isCenter 
                  ? 'w-full' 
                  : level > 0 
                    ? 'flex-1 ml-[4rem]' 
                    : 'w-1/2'
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

  // Show loading state
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

  // Show error state
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

  // Show empty state
  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader
          items={modules?.organization?.items}
          disableAdd
          disableDelete
          disableSearch
        />
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">No organization data available</div>
          <div className="text-sm text-gray-600 mt-2">
            Debug: Check console for API response details
          </div>
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
          <TreeNodeComponent
            key={rootNode.id}
            node={rootNode}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
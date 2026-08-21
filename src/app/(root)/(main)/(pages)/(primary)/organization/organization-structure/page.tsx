"use client";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { ExclamationIcon } from "@/src/icons/icons";
import { InlineLoading } from "@/src/app/loading";

/* ------------------------------------------------------------------ */
/* Types – match /organization-structure/vertical/hierarchy            */
/* ------------------------------------------------------------------ */
type NodeLevel =
  | "root"
  | "vertical"
  | "organization"
  | "department"
  | "businessUnit";

interface HierarchyNode {
  level: NodeLevel;
  code: string | null;
  name: string | null;
  name_arb?: string | null;
  depth?: number;
  childCount?: number;
  children?: HierarchyNode[];
}

const ROOT_LABEL_EN = "ALDAR";
const ROOT_LABEL_AR = "الدار";

const LEVEL_META: Record<NodeLevel, { en: string; ar: string; pill: string }> = {
  root: { en: "", ar: "", pill: "" },
  vertical: { en: "Vertical", ar: "القطاع", pill: "bg-indigo-100 text-indigo-700" },
  organization: { en: "Company", ar: "الشركة", pill: "bg-blue-100 text-blue-700" },
  department: { en: "Division", ar: "قسم", pill: "bg-emerald-100 text-emerald-700" },
  businessUnit: { en: "Department", ar: "القسم", pill: "bg-amber-100 text-amber-700" },
};

const keyOf = (node: HierarchyNode, index: number) =>
  `${node.level}-${node.code ?? node.name ?? index}`;

const ELBOW_Y = 24; // vertical centre of a card, where the elbow connects

/* ------------------------------------------------------------------ */
/* Single node (defined at module scope so its hooks stay stable)      */
/* ------------------------------------------------------------------ */
const OrgNode: React.FC<{
  node: HierarchyNode;
  path: string;
  index: number;
  isRTL: boolean;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}> = ({ node, path, index, isRTL, expanded, onToggle }) => {
  const hasChildren = !!(node.children && node.children.length);
  const isOpen = expanded.has(path);
  const isRoot = node.level === "root";
  const meta = LEVEL_META[node.level];
  const displayName = isRTL && node.name_arb ? node.name_arb : node.name ?? "—";

  const ulRef = useRef<HTMLUListElement | null>(null);
  const [spineH, setSpineH] = useState(0);

  // Measure the spine so it (and the beam) stops exactly at the last child.
  useLayoutEffect(() => {
    if (!isOpen || !hasChildren) {
      setSpineH(0);
      return;
    }
    const ul = ulRef.current;
    if (!ul) return;

    const compute = () => {
      const lis = ul.querySelectorAll<HTMLLIElement>(":scope > li");
      if (!lis.length) {
        setSpineH(0);
        return;
      }
      const last = lis[lis.length - 1];
      setSpineH(last.offsetTop + ELBOW_Y);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(ul);
    Array.from(ul.children).forEach((c) => ro.observe(c));
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
    // re-measure whenever this node opens or anything in the tree toggles
  }, [isOpen, hasChildren, expanded, node.children]);

  return (
    <li className="oc-li">
      <div
        className={[
          "oc-node",
          isOpen ? "oc-node--open" : "",
          hasChildren ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
        style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
        onClick={() => hasChildren && onToggle(path)}
        role={hasChildren ? "button" : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasChildren && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onToggle(path);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {!isRoot && meta.en && (
            <span
              className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${
                isOpen ? "bg-white/20 text-white" : meta.pill
              }`}
            >
              {isRTL ? meta.ar : meta.en}
            </span>
          )}
          <span className="font-semibold truncate" title={displayName}>
            {displayName}
          </span>
          {node.code && (
            <span
              className={`shrink-0 text-xs ${
                isOpen ? "text-white/70" : "text-gray-400"
              }`}
            >
              ({node.code})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasChildren && (
            <span
              className={`text-xs font-semibold rounded px-2 py-0.5 ${
                isOpen ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
              }`}
            >
              {String(node.children!.length).padStart(2, "0")}
            </span>
          )}
          {hasChildren && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div
          className="oc-branch"
          style={{ ["--spine-h" as any]: spineH ? `${spineH}px` : "0px" }}
        >
          {spineH > 0 && <span className="oc-spine" aria-hidden="true" />}
          {spineH > 0 && (
            <span className="oc-beam" aria-hidden="true">
              <i />
            </span>
          )}
          <ul className="oc-children" ref={ulRef}>
            {node.children!.map((child, i) => (
              <OrgNode
                key={keyOf(child, i)}
                node={child}
                path={`${path}/${keyOf(child, i)}`}
                index={i}
                isRTL={isRTL}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Page() {
  const { modules } = useLanguage();

  const {
    data: hierarchyData,
    isLoading,
    error,
  } = useFetchAllEntity("organization-hierarchy", {
    endpoint: "/organization-structure/vertical/hierarchy",
  });

  const [isRTL, setIsRTL] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsRTL(
        document.documentElement.dir === "rtl" ||
          document.documentElement.lang === "ar"
      );
    }
  }, []);

  const rootNode: HierarchyNode | null = useMemo(() => {
    const raw: HierarchyNode[] = hierarchyData?.data ?? [];

    // Drop placeholder nodes that have neither a name nor a code
    // (e.g. the empty "—" vertical produced by a blank row in the view).
    const clean = (nodes: HierarchyNode[]): HierarchyNode[] =>
      nodes
        .filter(
          (n) =>
            (n.name && n.name.trim() !== "") ||
            (n.code && n.code.trim() !== "")
        )
        .map((n) => ({
          ...n,
          children: n.children ? clean(n.children) : [],
        }));

    const verticals = clean(raw);
    if (!verticals.length) return null;
    return {
      level: "root",
      code: null,
      name: isRTL ? ROOT_LABEL_AR : ROOT_LABEL_EN,
      childCount: verticals.length,
      children: verticals,
    };
  }, [hierarchyData, isRTL]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
  useEffect(() => {
    if (rootNode) setExpanded((prev) => new Set(prev).add("root"));
  }, [rootNode]);

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const collect = (
    nodes: HierarchyNode[] | undefined,
    parent: string,
    acc: string[]
  ) => {
    (nodes ?? []).forEach((n, i) => {
      const p = `${parent}/${keyOf(n, i)}`;
      if (n.children && n.children.length) {
        acc.push(p);
        collect(n.children, p, acc);
      }
    });
  };
  const expandAll = () => {
    const all = ["root"];
    collect(rootNode?.children, "root", all);
    setExpanded(new Set(all));
  };
  const collapseAll = () => setExpanded(new Set(["root"]));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader items={modules?.organization?.items} disableAdd disableDelete disableSearch />
        <div className="flex justify-center items-center p-8">
          <InlineLoading message="Loading organization structure..." />
        </div>
      </div>
    );
  }

  if (error || !rootNode) {
    return (
      <div className="flex flex-col gap-4">
        <PowerHeader items={modules?.organization?.items} disableAdd disableDelete disableSearch />
        <div className="flex flex-col justify-center items-center p-8 gap-4">
          <p className="text-xs text-destructive border border-red-200 rounded-md px-2 py-1 font-semibold bg-red-400 bg-opacity-10 flex items-center">
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

      <div className="flex items-center justify-end gap-2 px-4">
        <button
          onClick={expandAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          {isRTL ? "توسيع الكل" : "Expand all"}
        </button>
        <button
          onClick={collapseAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          {isRTL ? "طي الكل" : "Collapse all"}
        </button>
      </div>

      <div className="oc-wrap px-4 py-4" dir={isRTL ? "rtl" : "ltr"}>
        <ul className="oc-tree">
          <OrgNode
            node={rootNode}
            path="root"
            index={0}
            isRTL={isRTL}
            expanded={expanded}
            onToggle={toggle}
          />
        </ul>
      </div>

      <style>{`
        .oc-wrap { width: 100%; overflow-x: hidden; }
        .oc-tree, .oc-tree ul { list-style: none; margin: 0; padding: 0; }

        .oc-node {
          --oc-line: #d1d9e6;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          max-width: 460px;
          min-height: 48px;
          padding: 10px 14px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e6e9f0;
          box-shadow: 0 1px 2px rgba(16,24,40,.06);
          color: #1f2937;
          font-size: 14px;
          transition: box-shadow .2s ease, transform .2s ease, background .2s ease;
          animation: ocPop .34s cubic-bezier(.2,.75,.25,1) both;
        }
        .oc-node:hover { box-shadow: 0 8px 22px rgba(16,24,40,.12); transform: translateY(-1px); }
        .oc-node--open {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 10px 26px rgba(29,78,216,.30);
        }

        /* indented branch (grows downward, never sideways) */
        .oc-branch {
          --oc-line: #d1d9e6;
          position: relative;
          padding-inline-start: 26px;
          margin-inline-start: 22px;
          margin-top: 4px;
        }
        .oc-children > li { position: relative; margin-top: 10px; }
        .oc-children > li:first-child { margin-top: 12px; }

        /* elbow connecting the spine to each card */
        .oc-children > li::before {
          content: "";
          position: absolute;
          inset-inline-start: -26px;
          top: ${ELBOW_Y}px;
          width: 26px;
          height: 2px;
          background: var(--oc-line);
          animation: ocLineIn .4s ease both;
        }

        /* spine + beam run down the branch, stopping at the last child */
        .oc-spine, .oc-beam {
          position: absolute;
          inset-inline-start: 0;
          top: 0;
          width: 2px;
          height: var(--spine-h, 0px);
        }
        .oc-spine {
          background: var(--oc-line);
          transform-origin: top;
          animation: ocStemIn .35s ease both;
        }
        .oc-beam { overflow: hidden; pointer-events: none; z-index: 1; }
        .oc-beam > i {
          position: absolute;
          left: 0;
          width: 2px;
          height: 16px;
          border-radius: 2px;
          background: linear-gradient(180deg, rgba(37,99,235,0) 0%, #2563eb 60%, #60a5fa 100%);
          box-shadow: 0 0 6px rgba(37,99,235,.7);
          animation: ocBeamV 1.8s cubic-bezier(.5,0,.5,1) infinite;
        }

        @keyframes ocPop {
          from { opacity: 0; transform: translateY(6px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes ocLineIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ocStemIn {
          from { opacity: 0; transform: scaleY(0); }
          to   { opacity: 1; transform: scaleY(1); }
        }
        @keyframes ocBeamV {
          0%   { top: -16px; opacity: 0; }
          20%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: var(--spine-h, 0px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .oc-node, .oc-children > li::before, .oc-spine, .oc-beam > i { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
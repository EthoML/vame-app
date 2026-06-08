import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useState,
    ReactNode,
} from "react";

// ============================================================================
// Page-header slot.
//
// The navbar used to show a static "VAME App" wordmark while every page
// rendered its own header row below it (title + metadata), wasting a full band
// of vertical space. Instead, each page now *publishes* its heading into this
// slot via usePageHeader(); the navbar renders it inline where the wordmark
// was. One header band, contextual to the current page.
// ============================================================================

type Ctx = {
    header: ReactNode;
    setHeader: (h: ReactNode) => void;
};

const PageHeaderContext = createContext<Ctx | null>(null);

export const PageHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [header, setHeader] = useState<ReactNode>(null);
    return (
        <PageHeaderContext.Provider value={{ header, setHeader }}>
            {children}
        </PageHeaderContext.Provider>
    );
};

/** Navbar-side: read whatever the current page published. */
export const usePageHeaderSlot = (): ReactNode => {
    const ctx = useContext(PageHeaderContext);
    return ctx ? ctx.header : null;
};

/**
 * Page-side: publish `content` into the navbar header slot for as long as the
 * page is mounted. Re-runs when `deps` change (e.g. async-loaded project data)
 * and clears on unmount so the next page starts from a clean slate.
 */
export const usePageHeader = (content: ReactNode, deps: React.DependencyList = []): void => {
    const ctx = useContext(PageHeaderContext);
    const setHeader = ctx?.setHeader;
    useLayoutEffect(() => {
        if (!setHeader) return;
        setHeader(content);
        return () => setHeader(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

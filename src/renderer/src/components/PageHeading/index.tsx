import React, { ReactNode } from "react";
import { Wrapper, TitleRow, TitleText, Meta, MetaItem } from "./styles";

export type MetaEntry = { label: string; value: string };

type Props = {
    title: string;
    /** Optional trailing action(s) beside the title (e.g. a refresh button). */
    actions?: ReactNode;
    /** Optional metadata chips rendered below the title (e.g. project facts). */
    meta?: MetaEntry[];
};

// The standard heading rendered into the navbar slot. Keeps every page's
// title — and the project page's metadata — visually identical.
const PageHeading: React.FC<Props> = ({ title, actions, meta }) => (
    <Wrapper>
        <TitleRow>
            <TitleText title={title}>{title}</TitleText>
            {actions}
        </TitleRow>
        {meta && meta.length > 0 && (
            <Meta>
                {meta
                    .filter((m) => m.value)
                    .map((m) => (
                        <MetaItem key={m.label}>
                            <b>{m.label}</b>
                            <span className="value" title={m.value}>
                                {m.value}
                            </span>
                        </MetaItem>
                    ))}
            </Meta>
        )}
    </Wrapper>
);

export default PageHeading;

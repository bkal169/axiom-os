import { useState } from "react";
import { useLS } from "../../hooks/useLS";
import { useAuth, useTier } from "../../context/AuthContext";
import { supa } from "../../lib/supabase";

import { Card, Field, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";

// Team Management simplified for V1
const TeamSection = ({ tier }: { tier: string }) => (
    <Card title="Team Management" action={<Badge label={tier.toUpperCase()} color="var(--c-gold)" />}>
        <div className="axiom-text-12-dim axiom-mb-16">
            Manage your team members and roles. Team features require a Pro or Enterprise plan.
        </div>
        <div className="axiom-widget-placeholder">
            <div className="axiom-text-14-dim axiom-mb-10">Team management coming soon to V1</div>
            <Button label="Invite Member" onClick={() => alert("Team features coming soon")} disabled />
        </div>
    </Card>
);

export function Settings() {
    const auth = useAuth() as any;
    const { tier } = useTier();

    const [profile, setProfile] = useLS("axiom_profile", {
        name: auth?.userProfile?.first_name ? `${auth.userProfile.first_name} ${auth.userProfile.last_name || ""}` : "",
        email: auth?.user?.email || "",
        company: auth?.userProfile?.company || "",
        role: "Developer",
        phone: "",
        timezone: "America/Los_Angeles"
    });

    const [apiKeys, setApiKeys] = useLS("axiom_api_keys", {
        proxyUrl: "", anthropic: "", openai: "", groq: "", together: "", costar: "", regrid: "", attom: "", google: ""
    });

    const [notifs, setNotifs] = useLS("axiom_notifs", {
        dealAlerts: true, listingAlerts: true, permitAlerts: false, weeklyDigest: true, emailNotifs: true, smsNotifs: false
    });

    const [saved, setSaved] = useState("");
    const doSave = (label: string) => {
        setSaved(label);
        setTimeout(() => setSaved(""), 2000);
    };

    const pu = (k: string) => (e: any) => setProfile({ ...profile, [k]: e.target.value });
    const au = (k: string) => (e: any) => setApiKeys({ ...apiKeys, [k]: e.target.value });

    return (
        <Tabs tabs={["Profile", "API Keys", "Notifications", "Team", "Connection"]}>
            <div>
                <Card title="User Profile">
                    <div className="axiom-grid-3 axiom-flex-gap-14">
                        <Field label="Full Name"><input className="axiom-input" value={profile.name} onChange={pu("name")} placeholder="Your name" title="Full Name" /></Field>
                        <Field label="Email"><input className="axiom-input" value={profile.email} onChange={pu("email")} placeholder="email@company.com" title="Email" /></Field>
                        <Field label="Company"><input className="axiom-input" value={profile.company} onChange={pu("company")} placeholder="Company name" /></Field>
                        <Field label="Role">
                            <select className="axiom-select" value={profile.role} onChange={pu("role")}>
                                {["Developer", "Investor", "Broker", "Analyst", "Manager", "Executive", "Consultant", "Attorney", "Other"].map(r => <option key={r}>{r}</option>)}
                            </select>
                        </Field>
                        <Field label="Phone"><input className="axiom-input" value={profile.phone} onChange={pu("phone")} placeholder="(555) 000-0000" /></Field>
                        <Field label="Timezone">
                            <select className="axiom-select" value={profile.timezone} onChange={pu("timezone")}>
                                {["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "America/Phoenix", "Pacific/Honolulu"].map(tz => <option key={tz}>{tz}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="axiom-mt-20">
                        <Button label={saved === "profile" ? "✓ Profile Saved!" : "Save Profile"} onClick={() => doSave("profile")} variant="gold" />
                    </div>
                </Card>
            </div>

            <div>
                <Card title="API Key Management">
                    <div className="axiom-text-12-dim axiom-mb-14">
                        Configure your LLM proxy for production, or use direct API keys for development.
                    </div>

                    <div className="axiom-card-inner-14 axiom-mb-14">
                        <Field label="LLM Proxy URL (Recommended for Production)">
                            <div className="axiom-flex-gap-8">
                                <input
                                    className={`axiom-input axiom-flex-1 ${apiKeys.proxyUrl ? 'axiom-border-green' : 'axiom-border-default'}`}
                                    value={apiKeys.proxyUrl}
                                    onChange={au("proxyUrl")}
                                    placeholder="https://your-project.supabase.co/functions/v1/llm-proxy"
                                    title="LLM Proxy URL"
                                />
                                {supa.configured() && !apiKeys.proxyUrl && (
                                    <Button label="Use Supabase" onClick={() => {
                                        const url = `${supa.url}/functions/v1/llm-proxy`;
                                        setApiKeys({ ...apiKeys, proxyUrl: url });
                                    }} />
                                )}
                            </div>
                        </Field>
                        <div className={`axiom-mt-4 axiom-text-10 ${apiKeys.proxyUrl ? 'axiom-text-green' : 'axiom-text-amber'}`}>
                            {apiKeys.proxyUrl ? "✓ Proxy configured — API keys are kept server-side" : "⚠ No proxy — keys are exposed in the browser (dev mode only)"}
                        </div>
                    </div>

                    <div className="axiom-grid-2 axiom-flex-gap-14">
                        {[
                            ["Anthropic (Claude)", "anthropic", "sk-ant-..."],
                            ["OpenAI", "openai", "sk-..."],
                            ["Groq", "groq", "gsk_..."],
                            ["Together AI", "together", "tog_..."],
                            ["CoStar", "costar", "cs_..."],
                            ["Regrid", "regrid", "rg_..."],
                            ["ATTOM Data", "attom", "at_..."],
                            ["Google Maps", "google", "AIza..."]
                        ].map(([label, key, ph]) => (
                            <Field key={key} label={label}>
                                <input className="axiom-input" type="password" value={(apiKeys as any)[key]} onChange={au(key)} placeholder={ph} />
                            </Field>
                        ))}
                    </div>
                    <div className="axiom-mt-20">
                        <Button label={saved === "api" ? "✓ API Keys Saved!" : "Save API Keys"} onClick={() => doSave("api")} variant="gold" />
                    </div>
                </Card>
            </div>

            <div>
                <Card title="Notification Preferences">
                    {[
                        ["Deal Stage Changes", "dealAlerts", "Get notified when deals advance stages"],
                        ["New Listing Matches", "listingAlerts", "Alerts for properties matching saved searches"],
                        ["Permit Activity", "permitAlerts", "Notifications for permit filings in target areas"],
                        ["Weekly Digest", "weeklyDigest", "Summary of pipeline activity and market updates"],
                        ["Email Notifications", "emailNotifs", "Receive notifications via email"],
                        ["SMS Notifications", "smsNotifs", "Receive notifications via text message"]
                    ].map(([label, key, desc]) => (
                        <div key={key} className="axiom-flex-center-gap-12-p10-bb">
                            <input type="checkbox" checked={!!(notifs as any)[key]} onChange={() => setNotifs({ ...notifs, [key]: !(notifs as any)[key] })} className="axiom-checkbox" title={label} />
                            <div className="axiom-flex-1">
                                <div className="axiom-text-13">{label}</div>
                                <div className="axiom-text-10-dim">{desc}</div>
                            </div>
                        </div>
                    ))}
                    <div className="axiom-mt-20">
                        <Button label="Save Preferences" onClick={() => doSave("notifs")} variant="gold" />
                    </div>
                </Card>
            </div>

            <div>
                <TeamSection tier={tier} />
            </div>

            <div>
                <Card title="Supabase Connection" action={<Badge label={supa.configured() ? "Connected" : "Not Set"} color={supa.configured() ? "var(--c-green)" : "var(--c-dim)"} />}>
                    <div className="axiom-text-11-dim axiom-mb-12">
                        Connect to Supabase for cloud persistence, multi-device sync, and team collaboration.
                    </div>
                    <div className="axiom-grid-2 axiom-flex-gap-14">
                        <Field label="Supabase URL">
                            <input className="axiom-input" value={localStorage.getItem("axiom_supa_url") || ""} onChange={e => localStorage.setItem("axiom_supa_url", e.target.value)} placeholder="https://xxxxx.supabase.co" title="Supabase URL" />
                        </Field>
                        <Field label="Anon / Publishable Key">
                            <input className="axiom-input" type="password" value={localStorage.getItem("axiom_supa_key") || ""} onChange={e => localStorage.setItem("axiom_supa_key", e.target.value)} placeholder="eyJhbGci..." title="Anon Key" />
                        </Field>
                    </div>
                    <div className="axiom-flex-gap-8 axiom-mt-16">
                        <Button label={saved === "supa" ? "✓ Saved!" : "Save Connection"} onClick={() => {
                            supa.url = localStorage.getItem("axiom_supa_url") || "";
                            supa.key = localStorage.getItem("axiom_supa_key") || "";
                            doSave("supa");
                            window.location.reload();
                        }} variant="gold" />
                    </div>
                </Card>

                <Card title="Storage Configuration">
                    <div className="axiom-text-11-dim axiom-mb-16">
                        Choose how your files (attachments, PDFs, reports) are stored.
                    </div>
                    <div className="axiom-grid-2 axiom-flex-gap-14">
                        {[
                            { id: "local", label: "Local (IndexedDB)", desc: "Fast, private, browser-only" },
                            { id: "cloud", label: "Cloud (Supabase)", desc: "Sync across devices", disabled: !supa.configured() }
                        ].map(m => (
                            <div
                                key={m.id}
                                className={`axiom-card-inner-14 axiom-cursor-pointer axiom-border-1 ${localStorage.getItem("axiom_storage_mode") === m.id ? 'axiom-border-gold' : 'axiom-border-default'} ${m.disabled ? 'axiom-opacity-50' : ''}`}
                                onClick={() => { if (!m.disabled) { localStorage.setItem("axiom_storage_mode", m.id); doSave("storage"); window.location.reload(); } }}
                            >
                                <div className="axiom-flex-sb-center">
                                    <div className="axiom-text-13-bold">{m.label}</div>
                                    {localStorage.getItem("axiom_storage_mode") === m.id && <Badge label="ACTIVE" color="var(--c-gold)" />}
                                </div>
                                <div className="axiom-text-10-dim axiom-mt-4">{m.desc}</div>
                                {m.disabled && <div className="axiom-text-9-amber axiom-mt-6">Requires Supabase connection</div>}
                            </div>
                        ))}
                    </div>
                    {saved === "storage" && <div className="axiom-text-9-gold-mt8">✓ Storage mode updated</div>}
                </Card>

                <Card title="Data Management">
                    {[
                        ["Export All Data", "Download complete backup of all project data as JSON"],
                        ["Clear Local Storage", "Remove all locally stored data (cannot be undone)"],
                        ["Import Project Data", "Restore from a previous backup file"],
                        ["Reset to Defaults", "Restore all settings and data to factory defaults"]
                    ].map(([l, d], i) => (
                        <div key={i} className="axiom-flex-center-gap-12-p10-bb">
                            <div className="axiom-flex-1">
                                <div className={`axiom-text-13 ${i >= 1 ? 'axiom-text-red' : 'axiom-text-sub'}`}>{l}</div>
                                <div className="axiom-text-10-dim">{d}</div>
                            </div>
                            <Button label={i === 0 ? "Export" : "Action"} onClick={() => alert("Action triggered")} variant={i === 0 ? "gold" : undefined} />
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}

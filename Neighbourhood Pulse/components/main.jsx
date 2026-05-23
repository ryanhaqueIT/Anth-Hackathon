// Main entry: design canvas composition + Tweaks panel + font-size scaling

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "fontSize": 16,
    "voiceTone": "warm",
    "showPrivacy": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Tone tweaks are reflected by the assistant copy; we expose them as CSS
  // variables on the root so any descendant can react too.
  React.useEffect(() => {
    document.documentElement.style.setProperty('--base', t.fontSize + 'px');
  }, [t.fontSize]);

  return (
    <>
      <DesignCanvas>

        <DCSection
          id="resident"
          title="Resident companion"
          subtitle="Responsive web · voice-first · proactive · designed for residents 65+"
        >
          <DCArtboard id="checkin" label="A · Hero · daily check-in"           width={460} height={920}>
            <ResidentCheckin/>
          </DCArtboard>
          <DCArtboard id="recs"    label="B · Empathy + recommendations"       width={460} height={920}>
            <ResidentRecs/>
          </DCArtboard>
          <DCArtboard id="support" label="C · Distress-aware support routing"  width={460} height={920}>
            <ResidentSupport/>
          </DCArtboard>
          <DCArtboard id="listen"  label="D · Voice listening state"           width={460} height={920}>
            <ResidentListening/>
          </DCArtboard>
        </DCSection>

        <DCSection
          id="council"
          title="Council insight"
          subtitle="Desktop · aggregated, privacy-safe"
        >
          <DCArtboard id="dashboard" label="A · Hero · Support Gap heatmap" width={1280} height={1080}>
            <ChromeWindow
              tabs={[{ title: 'Pulse · Insights' }, { title: 'Council intranet' }]}
              activeIndex={0}
              url="pulse.melbourne.vic.gov.au/insights/older-residents"
              width={1280} height={1080}
            >
              <CouncilHero/>
            </ChromeWindow>
          </DCArtboard>
          <DCArtboard id="suburb" label="B · Suburb drill-in · Carlton" width={1280} height={1200}>
            <ChromeWindow
              tabs={[{ title: 'Pulse · Carlton' }]}
              activeIndex={0}
              url="pulse.melbourne.vic.gov.au/insights/carlton"
              width={1280} height={1200}
            >
              <CouncilDetail/>
            </ChromeWindow>
          </DCArtboard>
        </DCSection>

        <DCPostIt top={140} right={48} rotate={3} width={240}>
          The companion <strong>initiates</strong> — a daily “how are you doing?” gathers gentle signals. When language turns distressed, it routes to a specialist (Lifeline, Beyond Blue) inside the conversation. The dashboard makes that pattern visible without exposing anyone.
        </DCPostIt>

      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accessibility"/>
        <TweakSlider
          label="Body text size"
          value={t.fontSize}
          min={14} max={26} step={1} unit="px"
          onChange={(v) => setTweak('fontSize', v)}
        />
        <TweakRadio
          label="Voice tone"
          value={t.voiceTone}
          options={[
            { value: 'warm',    label: 'Warm' },
            { value: 'plain',   label: 'Plain' },
            { value: 'formal',  label: 'Formal' },
          ]}
          onChange={(v) => setTweak('voiceTone', v)}
        />
        <TweakSection label="Council view"/>
        <TweakToggle
          label="Show privacy ribbon"
          value={t.showPrivacy}
          onChange={(v) => setTweak('showPrivacy', v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

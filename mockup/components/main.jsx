// Main entry — clickable prototype with shell + view switcher + Tweaks

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "fontSize": 16,
    "voiceTone": "warm"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--base', t.fontSize + 'px');
  }, [t.fontSize]);

  return (
    <>
      <AppShell/>

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
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { TextInput, Stack, Card, Text } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import classes from "./google-address-input.module.css";

type Suggestion = {
  description: string;
  place_id: string;
};

interface GoogleAddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: ReactNode;
}

export function GoogleAddressInput({ value, onChange, label, placeholder, error }: GoogleAddressInputProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mapAddressRef = useRef("");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || !data.action) return;

      if (data.action === "mapReady") {
        setIsReady(true);
      } else if (data.action === "suggestions") {
        if (data.predictions && data.status === "OK") {
          const nextSuggestions = data.predictions.map((p: { description: string; place_id: string }) => ({
              description: p.description,
              place_id: p.place_id,
            }));

          if (mapAddressRef.current && data.query === mapAddressRef.current) {
            const firstSuggestion = nextSuggestions[0];
            mapAddressRef.current = "";
            if (firstSuggestion && iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { action: "searchByPlaceId", placeId: firstSuggestion.place_id },
                "*"
              );
            }
            return;
          }

          setSuggestions(nextSuggestions);
          setShowSuggestions(true);
        } else {
          if (data.query === mapAddressRef.current) {
            mapAddressRef.current = "";
          }
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else if (data.action === "addressDetails") {
        setInputValue(data.formattedAddress);
        setShowSuggestions(false);
        if (onChange) onChange(data.formattedAddress);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onChange]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const address = (value || "").trim();
    if (!isReady || address.length < 3 || !iframeRef.current?.contentWindow) return;

    mapAddressRef.current = address;
    iframeRef.current.contentWindow.postMessage({ action: "getSuggestions", query: address }, "*");
  }, [isReady, value]);

  const sendQuery = useCallback(
    (query: string) => {
      if (!isReady || !iframeRef.current?.contentWindow) return;
      iframeRef.current.contentWindow.postMessage({ action: "getSuggestions", query }, "*");
    },
    [isReady]
  );

  function handleInputChange(val: string) {
    setInputValue(val);
    if (onChange) onChange(val);
    setShowSuggestions(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length > 2) {
      debounceRef.current = setTimeout(() => sendQuery(val), 400);
    }
  }

  function handleSelect(suggestion: Suggestion) {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    if (isReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { action: "searchByPlaceId", placeId: suggestion.place_id },
        "*"
      );
    }
  }

  function handleBlur() {
    setTimeout(() => setShowSuggestions(false), 200);
  }

  return (
    <Stack gap={4} pos="relative">
      <div className={classes.inputWrapper}>
        <TextInput
          label={label}
          placeholder={placeholder || "Adres yazın..."}
          value={inputValue}
          onChange={(e) => handleInputChange(e.currentTarget.value)}
          onBlur={handleBlur}
          error={error}
          leftSection={<IconMapPin size={16} stroke={1.5} />}
          autoComplete="nope"
        />
        {showSuggestions && suggestions.length > 0 && (
          <Card withBorder radius="md" shadow="sm" p={4} className={classes.dropdown}>
            {suggestions.map((s) => (
              <div
                key={s.place_id}
                className={classes.suggestionItem}
                onMouseDown={() => handleSelect(s)}
              >
                <Text size="sm">{s.description}</Text>
              </div>
            ))}
          </Card>
        )}
      </div>
      <iframe
        ref={iframeRef}
        src="https://sunucu.kuppo.net/files/maps.html?v=1"
        className={classes.iframe}
        title="maps"
      />
    </Stack>
  );
}

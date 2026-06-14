"use client";

import { useState } from "react";
import { Pagination as MantinePagination, NumberInput, Group, ActionIcon } from "@mantine/core";
import { useMediaQuery, usePagination } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";

interface PaginationProps {
  total: number;
  value: number;
  onChange: (page: number) => void;
  radius?: string;
  size?: "sm" | "md";
  siblings?: number;
}

interface ActivePageInputProps {
  page: number;
  onChange: (page: number) => void;
  totalPages: number;
  size: "sm" | "md";
}
function ActivePageInput({ page, onChange, totalPages, size }: ActivePageInputProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<number | string>(page);

  if (editing) {
    return (
      <NumberInput
        size={size}
        value={val}
        onChange={setVal}
        min={1}
        max={totalPages}
        hideControls
        w={size === "sm" ? 75 : 85}
        rightSection={
          <ActionIcon
            size={size === "sm" ? "xs" : "sm"}
            variant="subtle"
            color="green"
            onMouseDown={(e) => {
              e.preventDefault();
              const num = Number(val);
              if (num >= 1 && num <= totalPages) {
                onChange(num);
              }
              setEditing(false);
            }}
          >
            <IconCheck size={14} />
          </ActionIcon>
        }
        styles={{
          input: {
            paddingLeft: 4,
            paddingRight: size === "sm" ? "24px" : "28px",
            textAlign: "center",
            height: size === "sm" ? "30px" : "36px",
            minHeight: size === "sm" ? "30px" : "36px",
          },
          section: {
            width: size === "sm" ? "24px" : "28px",
          }
        }}
        autoFocus
        onBlur={() => {
          setEditing(false);
          const num = Number(val);
          if (num >= 1 && num <= totalPages && num !== page) {
            onChange(num);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const num = Number(val);
            if (num >= 1 && num <= totalPages) {
              onChange(num);
              setEditing(false);
            }
          } else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <MantinePagination.Control
      active
      onClick={() => {
        setVal(page);
        setEditing(true);
      }}
    >
      {page}
    </MantinePagination.Control>
  );
}

export function Pagination({
  total,
  value,
  onChange,
  radius = "md",
  size,
  siblings,
}: PaginationProps) {
  const isMobile = useMediaQuery("(max-width: 36em)", false, {
    getInitialValueInEffect: true,
  });

  const computedSize = size || (isMobile ? "sm" : "md");
  const computedSiblings = siblings !== undefined ? siblings : (isMobile ? 0 : 1);

  const pagination = usePagination({
    total,
    page: value,
    onChange,
    siblings: computedSiblings,
    boundaries: isMobile ? 0 : 1,
  });

  return (
    <MantinePagination.Root
      total={total}
      value={value}
      onChange={onChange}
      radius={radius}
      size={computedSize}
    >
      <Group gap={5}>
        <MantinePagination.Previous onClick={pagination.previous} />
        {pagination.range.map((item, index) => {
          if (item === "dots") {
            return <MantinePagination.Dots key={index} />;
          }

          if (item === value) {
            return (
              <ActivePageInput
                key={index}
                page={item}
                onChange={onChange}
                totalPages={total}
                size={computedSize}
              />
            );
          }

          return (
            <MantinePagination.Control
              key={index}
              active={item === value}
              onClick={() => pagination.setPage(item)}
            >
              {item}
            </MantinePagination.Control>
          );
        })}
        <MantinePagination.Next onClick={pagination.next} />
      </Group>
    </MantinePagination.Root>
  );
}

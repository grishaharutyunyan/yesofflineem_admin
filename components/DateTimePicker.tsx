"use client";
import React from "react";
import { DatePicker, TimePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--ink-2)",
  display: "block",
  marginBottom: "0.4rem",
  letterSpacing: "0.02em",
};

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

const themeConfig = {
  token: {
    colorPrimary: "#0a0a0a",
    borderRadius: 6,
    controlHeightLG: 48,
    fontSize: 15,
    fontFamily: "inherit",
  },
};

export function DatePickerInput({ value, onChange, label }: DatePickerProps) {
  const dayVal = value && dayjs(value, "YYYY-MM-DD", true).isValid() ? dayjs(value, "YYYY-MM-DD") : null;

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {label && <label style={labelStyle}>{label}</label>}
        <DatePicker
          size="large"
          value={dayVal}
          onChange={(_, dateString) => {
            const str = Array.isArray(dateString) ? dateString[0] : dateString;
            onChange(str || "");
          }}
          format="YYYY-MM-DD"
          placeholder="Select date"
          style={{
            width: "100%",
            height: "48px",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "var(--radius-sm)",
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        />
      </div>
    </ConfigProvider>
  );
}

export function TimePickerInput({ value, onChange, label }: TimePickerProps) {
  const formattedVal = value ? value.slice(0, 5) : "";
  const dayVal = formattedVal && dayjs(formattedVal, "HH:mm", true).isValid() ? dayjs(formattedVal, "HH:mm") : null;

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {label && <label style={labelStyle}>{label}</label>}
        <TimePicker
          size="large"
          value={dayVal}
          onChange={(_, timeString) => {
            const str = Array.isArray(timeString) ? timeString[0] : timeString;
            onChange(str || "09:00");
          }}
          format="HH:mm"
          minuteStep={5}
          needConfirm={false}
          placeholder="Select time"
          style={{
            width: "100%",
            height: "48px",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "var(--radius-sm)",
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        />
      </div>
    </ConfigProvider>
  );
}

export function TimeRangePickerInput({
  startTime,
  endTime,
  onChange,
  label,
}: {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
  label?: string;
}) {
  const startDay = startTime && dayjs(startTime, "HH:mm", true).isValid() ? dayjs(startTime, "HH:mm") : null;
  const endDay = endTime && dayjs(endTime, "HH:mm", true).isValid() ? dayjs(endTime, "HH:mm") : null;
  const val: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [startDay, endDay];

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {label && <label style={labelStyle}>{label}</label>}
        <TimePicker.RangePicker
          size="large"
          value={val}
          onChange={(_, timeStrings) => {
            const startStr = timeStrings[0] || "";
            const endStr = timeStrings[1] || "";
            onChange(startStr, endStr);
          }}
          format="HH:mm"
          minuteStep={5}
          needConfirm={false}
          placeholder={["Start time", "End time"]}
          style={{
            width: "100%",
            height: "48px",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "var(--radius-sm)",
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        />
      </div>
    </ConfigProvider>
  );
}

export function DateRangePickerInput({
  startDate,
  endDate,
  onChange,
  label,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  label?: string;
}) {
  const startDay = startDate && dayjs(startDate, "YYYY-MM-DD", true).isValid() ? dayjs(startDate, "YYYY-MM-DD") : null;
  const endDay = endDate && dayjs(endDate, "YYYY-MM-DD", true).isValid() ? dayjs(endDate, "YYYY-MM-DD") : null;
  const val: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [startDay, endDay];

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {label && <label style={labelStyle}>{label}</label>}
        <DatePicker.RangePicker
          size="large"
          value={val}
          onChange={(_, dateStrings) => {
            const startStr = dateStrings[0] || "";
            const endStr = dateStrings[1] || "";
            onChange(startStr, endStr);
          }}
          format="YYYY-MM-DD"
          placeholder={["Start date", "End date"]}
          style={{
            width: "100%",
            height: "48px",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "var(--radius-sm)",
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        />
      </div>
    </ConfigProvider>
  );
}

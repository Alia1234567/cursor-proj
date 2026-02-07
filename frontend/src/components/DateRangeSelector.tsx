import { useState, useEffect } from 'react';
import { Radio, DatePicker, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface DateRange {
  startDate: string; // ISO string
  endDate: string; // ISO string
}

interface DateRangeSelectorProps {
  onChange: (range: DateRange) => void;
}

type PresetOption = '7days' | '30days' | 'custom';

/**
 * Date Range Selector Component
 * Provides preset options (7 days, 30 days) and custom date range picker
 */
export default function DateRangeSelector({ onChange }: DateRangeSelectorProps) {
  const [preset, setPreset] = useState<PresetOption>('7days');
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  /**
   * Calculate date range for preset options
   */
  const getPresetRange = (option: '7days' | '30days'): DateRange => {
    const end = dayjs().endOf('day');
    const days = option === '7days' ? 7 : 30;
    const start = dayjs().subtract(days - 1, 'day').startOf('day');

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  /**
   * Handle preset option change
   */
  const handlePresetChange = (e: RadioChangeEvent) => {
    const value = e.target.value as PresetOption;
    setPreset(value);

    if (value !== 'custom') {
      const range = getPresetRange(value);
      onChange(range);
      setCustomRange(null);
    }
  };

  /**
   * Handle custom date range change
   */
  const handleCustomRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setCustomRange(dates);

    if (dates && dates[0] && dates[1]) {
      onChange({
        startDate: dates[0].startOf('day').toISOString(),
        endDate: dates[1].endOf('day').toISOString(),
      });
    }
  };

  // Initialize with 7 days range on mount
  useEffect(() => {
    onChange(getPresetRange('7days'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Radio.Group value={preset} onChange={handlePresetChange} buttonStyle="solid">
        <Radio.Button value="7days">Last 7 Days</Radio.Button>
        <Radio.Button value="30days">Last 30 Days</Radio.Button>
        <Radio.Button value="custom">Custom Range</Radio.Button>
      </Radio.Group>

      {preset === 'custom' && (
        <RangePicker
          value={customRange}
          onChange={handleCustomRangeChange}
          format="YYYY-MM-DD"
          className="w-full"
          allowClear
          disabledDate={(current) => {
            // Disable future dates
            return current && current > dayjs().endOf('day');
          }}
        />
      )}
    </Space>
  );
}


"use client";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      onChange={(e) => (e.target.form as HTMLFormElement).submit()}
      style={{ border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#374151" }}
    >
      <option value="newest">Newest first</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
    </select>
  );
}
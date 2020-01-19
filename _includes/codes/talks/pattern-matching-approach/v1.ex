defmodule ErgZone.WorkoutMode do
  def run([%{type: "dist"}]) do
    "FixedDistSplits"
  end

  def run([%{type: "time"}]) do
    "FixedTimeSplits"
  end

  def run([
        %{type: t}
        | [%{type: t} | _] = tail
      ]) do
    run(tail)
  end

  def run(_intervals) do
    "VariableInterval"
  end
end

defmodule ErgZone.WorkoutMode do
  def run([
    %{type: t, rest: r} | [
      %{type: t, rest: r} | _
    ] = tail
  ]) do
    run(tail)
  end

  def run([%{type: "dist", rest: 0}]) do
    "FixedDistSplits"
  end

  def run([%{type: "dist", rest: _}]) do
    "FixedDistSplits"
  end

  def run([%{type: "time", rest: 0}]) do
    "FixedTimeSplits"
  end

  def run([%{type: "time", rest: _}]) do
    "FixedTimeSplits"
  end

  def run(_intervals) do
    "VariableInterval"
  end
end

class ErgZone::WorkoutMode do
  def self.run(intervals)
    all_types = intervals.map(&:type)
    uniq_types = all_types.uniq

    if uniq_types.size > 1
      return "VariableInterval"
    end

    case uniq_types[0]
      when "dist" then "FixedDistSplits"
      when "time" then "FixedTimeSplits"
    end
  end
end

class ErgZone::WorkoutMode do
  def self.run(intervals)
    all_types = intervals.map(&:type)
    uniq_types = all_types.uniq

    all_rests = intervals.map(&:rest)
    uniq_rests = all_rests.uniq

    if uniq_types.size > 1 || uniq_rests.size > 1
      return "VariableInterval"
    end

    if uniq_rests[0] == 0
      case uniq_types[0]
        when "dist" then "FixedDistSplits"
        when "time" then "FixedTimeSplits"
      end
    else
      case uniq_types[0]
        when "dist" then "FixedDistInterval"
        when "time" then "FixedTimeInterval"
      end
    end
  end
end

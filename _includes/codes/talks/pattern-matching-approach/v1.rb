class ErgZone::WorkoutMode do
  def self.run(intervals)
    first_type = intervals[0].type

    same_type = intervals.all? do |interval|
      interval.type == first_type
    end

    return "VariableInterval" unless same_type

    case first_type
      when "dist" then "FixedDistSplits"
      when "time" then "FixedTimeSplits"
    end
  end
end

class ErgZone::WorkoutMode do
  def self.run(intervals)
    first_type = intervals[0].type
    first_rest = intervals[0].rest

    same_type = intervals.all? do |interval|
      interval.type == first_type
    end

    same_rest = intervals.all? do |interval|
      interval.rest == first_rest
    end

    if same_type && same_rest
      with_rest = first_rest > 0

      if first_type == "dist"
        if with_rest
          "FixedDistInterval"
        else
          "FixedDistSplits"
        end
      else
        if with_rest
          "FixedTimeInterval"
        else
          "FixedTimeSplits"
        end
      end
    else
      "VariableInterval"
    end
  end
end

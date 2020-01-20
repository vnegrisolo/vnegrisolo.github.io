class ErgZone::WorkoutMode do
  def self.run(intervals)
    new(intervals).run
  end

  def initialize(intervals)
    @intervals = intervals
    @first_type = intervals[0].type
  end

  attr_reader :intervals, :first_type

  def run
    return "VariableInterval" unless same_type?

    case first_type
      when "dist" then "FixedDistSplits"
      when "time" then "FixedTimeSplits"
    end
  end

  def same_type?
    intervals.all? do |interval|
      interval.type == first_type
    end
  end
end

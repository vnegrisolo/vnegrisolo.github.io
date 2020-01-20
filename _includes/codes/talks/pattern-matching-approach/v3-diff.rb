 class ErgZone::WorkoutMode do
   def self.run(intervals)
     new(intervals).run
   end
 
   def initialize(intervals)
-    @intervals = intervals
-    @first_type = intervals[0].type
-    @first_rest = intervals[0].rest
+    @first_interval = intervals[0]
+    @intervals = intervals[0..-2]
+    @last_interval = intervals[-1]
   end
 
-  attr_reader :intervals, :first_type, :first_rest
+  attr_reader :first_interval, :intervals, :last_interval
 
   def run
-    if same_type? && same_rest?
-      if first_type == "dist"
+    if same_type? && same_value? && same_rest? && first_bigger_than_last?
+      if first_interval.first_type == "dist"
         if with_rest?
           "FixedDistInterval"
         else
           "FixedDistSplits"
         end
       else
         if with_rest?
           "FixedTimeInterval"
         else
           "FixedTimeSplits"
         end
       end
     else
       "VariableInterval"
     end
   end
 
   def same_type?
     intervals.all? do |interval|
       interval.type == first_type
     end
   end
 
+  def same_value?
+    intervals.all? do |interval|
+      interval.value == first_value
+    end
+  end
+
   def same_rest?
     intervals.all? do |interval|
       interval.rest == first_rest
     end
   end
 
+  def first_bigger_than_last?
+    first_interval.value >= last_interval.value &&
+      first_interval.rest >= last_interval.rest
+  end
+
   def with_rest?
     first_rest > 0
   end
 end

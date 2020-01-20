 class ErgZone::WorkoutMode do
   def self.run(intervals)
     new(intervals).run
   end
 
   def initialize(intervals)
     @intervals = intervals
     @first_type = intervals[0].type
+    @first_rest = intervals[0].rest
   end
 
-  attr_reader :intervals, :first_type
+  attr_reader :intervals, :first_type, :first_rest
 
   def run
-    return "VariableInterval" unless same_type?
-
-    case first_type
-      when "dist" then "FixedDistSplits"
-      when "time" then "FixedTimeSplits"
+    if same_type? && same_rest?
+      if first_type == "dist"
+        if with_rest?
+          "FixedDistInterval"
+        else
+          "FixedDistSplits"
+        end
+      else
+        if with_rest?
+          "FixedTimeInterval"
+        else
+          "FixedTimeSplits"
+        end
+      end
+    else
+      "VariableInterval"
     end
   end
 
   def same_type?
     intervals.all? do |interval|
       interval.type == first_type
     end
   end
+
+  def same_rest?
+    intervals.all? do |interval|
+      interval.rest == first_rest
+    end
+  end
+
+  def with_rest?
+    first_rest > 0
+  end
 end

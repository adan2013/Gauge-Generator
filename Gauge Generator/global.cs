using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gauge_Generator
{
    public static class Global
    {
        public const float MIN_FLOAT_VALUE = 0.2f;
        public const float MAX_FLOAT_VALUE = 0.8f;
        public const float MIN_RANGE_VALUE = -500f;
        public const float MAX_RANGE_VALUE = 500f;

        

        public static ProjectData project = new ProjectData();
    }
}

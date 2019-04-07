using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gauge_Generator
{
    [Serializable()]
    class ProjectData
    {
        int pImageSize = 100;
        List<Layer> layers = new List<Layer>();

        public int ImageSize
        {
            get { return pImageSize; }
            set
            {
                if(value >= 100 && value <= 1000)
                {
                    pImageSize = value;
                    //TODO event size changed
                }
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows.Media;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    [Serializable()]
    public class ProjectData
    {
        //EVENTS
        public delegate void d_ImageSizeChanged(int newSize);
        public event d_ImageSizeChanged ImageSizeChanged;

        //PRIVATE
        int pImageSize = 300;

        //PUBLIC
        public List<Layer> layers = new List<Layer>();

        //PROPERTIES
        public int ImageSize
        {
            get { return pImageSize; }
            set
            {
                if(value >= 300 && value <= 1000)
                {
                    pImageSize = value;
                    ImageSizeChanged?.Invoke(value);
                }
            }
        }

        public Color BackgroundColor { get; set; }

        public Color ForegroundColor { get; set; }

        public bool RoundForeground { get; set; }

        public ProjectData()
        {
            BackgroundColor = Colors.Transparent;
            ForegroundColor = Colors.Black;
            RoundForeground = true;
        }

        public void DrawProject(ref Canvas pnl, int size)
        {
            pnl.Children.Clear();
            if (RoundForeground)
            {
                pnl.Background = new SolidColorBrush(BackgroundColor);
                Ellipse el = new Ellipse
                {
                    Fill = new SolidColorBrush(ForegroundColor),
                    Width = size,
                    Height = size
                };
                pnl.Children.Add(el);
            }
            else
            {
                pnl.Background = new SolidColorBrush(ForegroundColor);
            }
            for(int i = layers.Count - 1; i >= 0; i--)
            {
                layers[i].DrawLayer(ref pnl, size);
            }
            if (Global.EditingLayer != null) Global.EditingLayer.DrawOverlay(ref pnl, size, 1);
        }
    }
}

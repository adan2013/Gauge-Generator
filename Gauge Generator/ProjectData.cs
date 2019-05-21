using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    [Serializable()]
    public class ProjectData
    {
        //EVENTS
        public delegate void d_ImageSizeChanged(int newSize);
        public event d_ImageSizeChanged ImageSizeChanged;

        public List<Layer> layers = new List<Layer>();
        public int _imagesize = 300;
        public string _backgroundcolor;
        public string _foregroundcolor;
        public bool _roundforeground;

        //PROPERTIES
        [Description(""), Category("Export")]
        public int ImageSize
        {
            get { return _imagesize; }
            set
            {
                if(value >= 300 && value <= 1000)
                {
                    _imagesize = value;
                    ImageSizeChanged?.Invoke(value);
                }
            }
        }
        [Description(""), Category("Background")]
        public MEDIA.Color BackgroundColor
        {
            get { return Layer.StringToMediaColor(_backgroundcolor); }
            set { _backgroundcolor = Layer.MediaColorToString(value, false); }
        }
        [Description(""), Category("Background")]
        public MEDIA.Color ForegroundColor
        {
            get { return Layer.StringToMediaColor(_foregroundcolor); }
            set { _foregroundcolor = Layer.MediaColorToString(value, false); }
        }
        [Description(""), Category("Background")]
        public bool RoundForeground
        {
            get { return _roundforeground; }
            set { _roundforeground = value; }
        }

        [Browsable(false)]
        public bool ShowOnlyThisLayer { get; set; }
        [Browsable(false)]
        public bool BringToFront { get; set; }
        [Browsable(false)]
        public bool HideOverlay { get; set; }

        public ProjectData()
        {
            BackgroundColor = MEDIA.Colors.Transparent;
            ForegroundColor = MEDIA.Colors.Black;
            RoundForeground = true;
        }

        public void DrawProject(ref Canvas pnl, bool HQmode, int size)
        {
            pnl.Children.Clear();
            //background
            if (RoundForeground)
            {
                pnl.Background = new MEDIA.SolidColorBrush(BackgroundColor);
                Ellipse el = new Ellipse
                {
                    Fill = new MEDIA.SolidColorBrush(ForegroundColor),
                    Width = size,
                    Height = size
                };
                pnl.Children.Add(el);
            }
            else
            {
                pnl.Background = new MEDIA.SolidColorBrush(ForegroundColor);
            }
            //layers
            for(int i = layers.Count - 1; i >= 0; i--)
            {
                if(Global.EditingLayer != null)
                {
                    if (ShowOnlyThisLayer && layers[i] != Global.EditingLayer) continue;
                    if (BringToFront && layers[i] == Global.EditingLayer) continue;
                    if (layers[i].RangeSource == Global.EditingLayer) continue;
                }
                else
                {
                    if (!layers[i].Visible) continue;
                }
                layers[i].DrawLayer(ref pnl, HQmode, size);
            }
            if (BringToFront && Global.EditingLayer != null) Global.EditingLayer.DrawLayer(ref pnl, HQmode, size);
            //overlay
            if (Global.EditingLayer != null && (Global.EditingLayer is Range_Item || !HideOverlay)) Global.EditingLayer.DrawOverlay(ref pnl, HQmode, size, 1);
        }
    }
}

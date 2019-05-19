using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Global.SetSidebarObject(sidebar_frame, sidebar_title);
            Global.SetSidebar(Global.SidebarPages.Layers);
            Global.ScreenCanvas = preview;
            MEDIA.Animation.Timeline.DesiredFrameRateProperty.OverrideMetadata(typeof(MEDIA.Animation.Timeline), new FrameworkPropertyMetadata { DefaultValue = 15 });
        }

        private void Preview_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            double w = e.NewSize.Width - 20;
            double h = e.NewSize.Height - 20;
            preview.Width = Math.Min(w, h);
            preview.Height = Math.Min(w, h);
            Global.RefreshScreen();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            //TODO diagnostic code
            Global.project.layers.Add(new NumericScale_Item());
            Global.project.layers.Add(new Range_Item());
            Global.project.layers[0].SetRangeSource((Range_Item)Global.project.layers[1]);
            //Global.EditingLayer = Global.project.layers[0];
            //Global.SetSidebar(Global.SidebarPages.Editor);
            Global.SetSidebar(Global.SidebarPages.Layers);
        }
    }
}
